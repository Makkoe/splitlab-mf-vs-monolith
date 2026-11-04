// Measures real build time and bundle size of every deployable unit and writes lab/public/metrics.json
import { execSync } from 'node:child_process'
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const RUNS = Number(process.env.RUNS ?? 3)
const targets = [
  { name: 'monolith', dir: 'monolith', arch: 'monolith' },
  { name: 'shell', dir: 'mf/shell', arch: 'mf' },
  { name: 'catalog', dir: 'mf/catalog', arch: 'mf' },
  { name: 'checkout', dir: 'mf/checkout', arch: 'mf' },
  { name: 'reviews', dir: 'mf/reviews', arch: 'mf' },
]

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]))

const results = []
for (const t of targets) {
  const cwd = join(root, t.dir)
  const times = []
  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now()
    execSync('npx vite build --logLevel error', { cwd, stdio: 'inherit' })
    times.push(Math.round(performance.now() - t0))
  }
  const files = walk(join(cwd, 'dist')).filter((f) => f.endsWith('.js'))
  // React remotes ship fallback copies of shared deps; the shell already provides them, so they are never fetched.
  const isFallback = (f) => t.arch === 'mf' && t.name !== 'shell' && t.name !== 'reviews' &&
    (/__federation_shared_[^\\/]+[\\/]/.test(f) || /[\\/](react|react-dom|client|jsx-runtime)-[\w-]{8}\.js$/.test(f))
  let raw = 0, gz = 0, runtimeGz = 0
  for (const f of files) {
    const b = readFileSync(f), g = gzipSync(b).length
    raw += b.length; gz += g
    if (!isFallback(f)) runtimeGz += g
  }
  times.sort((a, b) => a - b)
  const r = { name: t.name, arch: t.arch, buildMs: times[Math.floor(times.length / 2)], runs: times, jsBytes: raw, artifactGzipBytes: gz, gzipBytes: runtimeGz, files: files.length }
  results.push(r)
  console.log(`${t.name.padEnd(10)} median ${r.buildMs} ms  js ${(raw / 1024).toFixed(1)} KB  gzip ${(gz / 1024).toFixed(1)} KB  runtime gzip ${(runtimeGz / 1024).toFixed(1)} KB`)
}

const payload = JSON.stringify({ measuredAt: new Date().toISOString(), runs: RUNS, node: process.version, results }, null, 2)
for (const dir of ['lab/public', 'defense/public']) {
  mkdirSync(join(root, dir), { recursive: true })
  writeFileSync(join(root, dir, 'metrics.json'), payload)
  console.log(`\n✔ ${dir}/metrics.json written`)
}
