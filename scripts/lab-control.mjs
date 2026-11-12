/**
 * SPLITLAB control plane (:5111) — stop/start remotes, real independent releases,
 * metrics history, experiment report export.
 */
import http from 'node:http'
import { spawn, execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const PORT = Number(process.env.LAB_CONTROL_PORT || 5111)
const children = new Map()

const REMOTES = {
  catalog: { dir: 'mf/catalog', port: 5201 },
  checkout: { dir: 'mf/checkout', port: 5202 },
  reviews: { dir: 'mf/reviews', port: 5203 },
}

const historyPath = join(root, 'defense/public/metrics-history.json')
const reportPath = join(root, 'defense/public/last-report.json')

function json(res, code, body) {
  const data = JSON.stringify(body, null, 2)
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(data)
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch {
        resolve({})
      }
    })
  })
}

function portListening(port) {
  try {
    if (process.platform === 'win32') {
      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' })
      return /LISTENING/i.test(out)
    }
    execSync(`lsof -iTCP:${port} -sTCP:LISTEN`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function killPort(port) {
  try {
    if (process.platform === 'win32') {
      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' })
      const pids = new Set()
      for (const line of out.split(/\r?\n/)) {
        if (!/LISTENING/i.test(line)) continue
        const parts = line.trim().split(/\s+/)
        const pid = parts[parts.length - 1]
        if (pid && /^\d+$/.test(pid) && pid !== '0') pids.add(pid)
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' })
        } catch {
          /* ignore */
        }
      }
    } else {
      try {
        execSync(`lsof -tiTCP:${port} -sTCP:LISTEN | xargs -r kill -9`, { stdio: 'ignore' })
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* nothing listening */
  }
  const child = children.get(port)
  if (child) {
    try {
      child.kill('SIGTERM')
    } catch {
      /* ignore */
    }
    children.delete(port)
  }
}

function remoteEntryPath(name) {
  return join(root, REMOTES[name].dir, 'dist/assets/remoteEntry.js')
}

function fileMeta(file) {
  if (!existsSync(file)) return null
  const st = statSync(file)
  const buf = readFileSync(file)
  return {
    path: file.replace(root, '').replace(/\\/g, '/'),
    bytes: st.size,
    mtime: st.mtime.toISOString(),
    sha256: createHash('sha256').update(buf).digest('hex').slice(0, 12),
  }
}

function readVersion(name) {
  const p = join(root, REMOTES[name].dir, 'version.json')
  return JSON.parse(readFileSync(p, 'utf8'))
}

function bumpVersion(name) {
  const p = join(root, REMOTES[name].dir, 'version.json')
  const cur = JSON.parse(readFileSync(p, 'utf8'))
  const [maj, min, pat] = cur.version.split('.').map(Number)
  const next = { version: `${maj}.${min}.${pat + 1}`, releasedAt: new Date().toISOString() }
  writeFileSync(p, JSON.stringify(next, null, 2) + '\n')
  return { previous: cur, next }
}

function buildRemote(name) {
  const cwd = join(root, REMOTES[name].dir)
  const t0 = Date.now()
  execSync('npx vite build --logLevel error', { cwd, stdio: 'inherit' })
  return Date.now() - t0
}

function startRemote(name) {
  const { dir, port } = REMOTES[name]
  if (portListening(port)) return { already: true, port }
  const cwd = join(root, dir)
  const child = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['vite', 'preview', '--port', String(port), '--strictPort'],
    { cwd, stdio: 'ignore', detached: false, shell: process.platform === 'win32' },
  )
  children.set(port, child)
  child.on('exit', () => {
    if (children.get(port) === child) children.delete(port)
  })
  return { already: false, port, pid: child.pid }
}

async function waitPort(port, ms = 15000) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (portListening(port)) return true
    await new Promise((r) => setTimeout(r, 250))
  }
  return portListening(port)
}

function remotesStatus() {
  return Object.fromEntries(
    Object.entries(REMOTES).map(([name, cfg]) => {
      const ver = readVersion(name)
      return [
        name,
        {
          port: cfg.port,
          up: portListening(cfg.port),
          version: ver.version,
          releasedAt: ver.releasedAt,
          remoteEntry: fileMeta(remoteEntryPath(name)),
        },
      ]
    }),
  )
}

function loadHistory() {
  if (!existsSync(historyPath)) return []
  try {
    return JSON.parse(readFileSync(historyPath, 'utf8'))
  } catch {
    return []
  }
}

function appendHistory(entry) {
  const hist = loadHistory()
  hist.push(entry)
  mkdirSync(dirname(historyPath), { recursive: true })
  writeFileSync(historyPath, JSON.stringify(hist.slice(-30), null, 2))
  return hist
}

function walkJs(dir) {
  if (!existsSync(dir)) return []
  const out = []
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) out.push(...walkJs(p))
    else if (f.endsWith('.js')) out.push(p)
  }
  return out
}

function bundleMap() {
  const units = [
    { name: 'monolith', dir: 'monolith/dist', arch: 'monolith' },
    { name: 'shell', dir: 'mf/shell/dist', arch: 'mf' },
    { name: 'catalog', dir: 'mf/catalog/dist', arch: 'mf' },
    { name: 'checkout', dir: 'mf/checkout/dist', arch: 'mf' },
    { name: 'reviews', dir: 'mf/reviews/dist', arch: 'mf' },
  ]
  return units.map((u) => {
    const files = walkJs(join(root, u.dir)).map((f) => {
      const st = statSync(f)
      return { name: f.split(/[/\\]/).pop(), bytes: st.size }
    })
    files.sort((a, b) => b.bytes - a.bytes)
    return {
      ...u,
      totalBytes: files.reduce((s, f) => s + f.bytes, 0),
      files: files.slice(0, 12),
    }
  })
}

function buildReport(extra = {}) {
  const metricsFile = join(root, 'defense/public/metrics.json')
  const metrics = existsSync(metricsFile) ? JSON.parse(readFileSync(metricsFile, 'utf8')) : null
  const report = {
    generatedAt: new Date().toISOString(),
    remotes: remotesStatus(),
    ports: {
      defense: portListening(5100),
      shell: portListening(5200),
      monolith: portListening(5300),
      labControl: true,
    },
    metrics,
    historyCount: loadHistory().length,
    bundleMap: bundleMap(),
    ...extra,
  }
  writeFileSync(reportPath, JSON.stringify(report, null, 2))
  writeFileSync(join(root, 'defense/public/last-report.md'), toMarkdown(report))
  return report
}

function toMarkdown(report) {
  const lines = [
    `# SPLITLAB experiment report`,
    ``,
    `Generated: ${report.generatedAt}`,
    ``,
    `## Ports`,
    `- defense :5100 — ${report.ports.defense ? 'UP' : 'DOWN'}`,
    `- shell :5200 — ${report.ports.shell ? 'UP' : 'DOWN'}`,
    `- monolith :5300 — ${report.ports.monolith ? 'UP' : 'DOWN'}`,
    ``,
    `## Remotes`,
  ]
  for (const [name, r] of Object.entries(report.remotes)) {
    lines.push(
      `- **${name}** v${r.version} · :${r.port} · ${r.up ? 'UP' : 'DOWN'}` +
        (r.remoteEntry ? ` · entry ${r.remoteEntry.sha256} · ${r.remoteEntry.bytes} B` : ''),
    )
  }
  if (report.metrics?.results) {
    lines.push('', '## Build metrics')
    for (const r of report.metrics.results) {
      lines.push(`- ${r.name}: build ${r.buildMs} ms · gzip ${(r.gzipBytes / 1024).toFixed(1)} KB`)
    }
  }
  if (report.lastRelease) {
    lines.push('', '## Last independent release', '```json', JSON.stringify(report.lastRelease, null, 2), '```')
  }
  if (report.runtime) {
    lines.push('', '## Runtime probes', '```json', JSON.stringify(report.runtime, null, 2), '```')
  }
  lines.push('')
  return lines.join('\n')
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {})
  const url = new URL(req.url || '/', `http://localhost:${PORT}`)
  const pathName = url.pathname

  try {
    if (pathName === '/api/health') {
      return json(res, 200, { ok: true, port: PORT, remotes: remotesStatus() })
    }

    if (pathName === '/api/remotes' && req.method === 'GET') {
      return json(res, 200, remotesStatus())
    }

    const stopMatch = pathName.match(/^\/api\/remotes\/(\w+)\/stop$/)
    if (stopMatch && req.method === 'POST') {
      const name = stopMatch[1]
      if (!REMOTES[name]) return json(res, 404, { error: 'unknown remote' })
      killPort(REMOTES[name].port)
      await new Promise((r) => setTimeout(r, 400))
      return json(res, 200, { name, up: portListening(REMOTES[name].port), remotes: remotesStatus() })
    }

    const startMatch = pathName.match(/^\/api\/remotes\/(\w+)\/start$/)
    if (startMatch && req.method === 'POST') {
      const name = startMatch[1]
      if (!REMOTES[name]) return json(res, 404, { error: 'unknown remote' })
      if (!existsSync(remoteEntryPath(name))) buildRemote(name)
      startRemote(name)
      const up = await waitPort(REMOTES[name].port)
      return json(res, 200, { name, up, remotes: remotesStatus() })
    }

    const releaseMatch = pathName.match(/^\/api\/remotes\/(\w+)\/release$/)
    if (releaseMatch && req.method === 'POST') {
      const name = releaseMatch[1]
      if (!REMOTES[name]) return json(res, 404, { error: 'unknown remote' })
      const before = fileMeta(remoteEntryPath(name))
      const bumped = bumpVersion(name)
      const buildMs = buildRemote(name)
      killPort(REMOTES[name].port)
      await new Promise((r) => setTimeout(r, 500))
      startRemote(name)
      const up = await waitPort(REMOTES[name].port)
      const after = fileMeta(remoteEntryPath(name))
      const result = {
        name,
        previousVersion: bumped.previous.version,
        nextVersion: bumped.next.version,
        buildMs,
        shellRebuilt: false,
        monolithRebuilt: false,
        remoteEntryBefore: before,
        remoteEntryAfter: after,
        up,
        note: 'Independent deploy: only this remote was rebuilt and re-served. Shell and monolith processes were not rebuilt.',
      }
      const report = buildReport({ lastRelease: result })
      return json(res, 200, { ...result, reportPath: '/last-report.json' })
    }

    if (pathName === '/api/metrics' && req.method === 'GET') {
      const p = join(root, 'defense/public/metrics.json')
      if (!existsSync(p)) return json(res, 404, { error: 'no metrics yet — run npm run measure' })
      return json(res, 200, JSON.parse(readFileSync(p, 'utf8')))
    }

    if (pathName === '/api/metrics/history' && req.method === 'GET') {
      return json(res, 200, { history: loadHistory() })
    }

    if (pathName === '/api/bundle-map' && req.method === 'GET') {
      return json(res, 200, { units: bundleMap() })
    }

    if (pathName === '/api/report' && req.method === 'GET') {
      return json(res, 200, buildReport())
    }

    if (pathName === '/api/report' && req.method === 'POST') {
      const body = await readBody(req)
      const report = buildReport(body)
      return json(res, 200, report)
    }

    if (pathName === '/api/measure' && req.method === 'POST') {
      json(res, 202, { started: true, message: 'measure running — poll /api/metrics' })
      setTimeout(() => {
        try {
          execSync('node scripts/measure.mjs', { cwd: root, stdio: 'inherit' })
        } catch (e) {
          console.error('measure failed', e)
        }
      }, 10)
      return
    }

    json(res, 404, { error: 'not found', path: pathName })
  } catch (e) {
    console.error(e)
    json(res, 500, { error: String(e?.message || e) })
  }
})

server.listen(PORT, () => {
  console.log(`[lab-control] http://localhost:${PORT}`)
  console.log(`[lab-control] remotes:`, remotesStatus())
})

process.on('exit', () => {
  for (const [, child] of children) {
    try {
      child.kill()
    } catch {
      /* ignore */
    }
  }
})
