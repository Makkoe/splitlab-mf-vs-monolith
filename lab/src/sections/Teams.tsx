import { useState } from 'react'

/**
 * Team scaling model (transparent, parametrised):
 *  Monolith: every team shares one codebase/release → communication paths n(n−1)/2 (Brooks),
 *            merge-conflict probability 1−(1−p)^(n−1), release queue grows linearly.
 *  MF:       teams interact only through explicit contracts with the shell → ~n−1 paths,
 *            conflicts limited to shared contracts, parallel releases.
 */
export function Teams() {
  const [n, setN] = useState(6)
  const [p, setP] = useState(8) // % chance two teams touch the same code per sprint

  const monoPaths = (k: number) => (k * (k - 1)) / 2
  const mfPaths = (k: number) => Math.max(0, k - 1)
  const conflict = (k: number, pp: number) => 1 - Math.pow(1 - pp / 100, k - 1)
  // effective productivity per team (0..1): overhead from communication + conflicts
  const prodMono = (k: number) => 1 / (1 + 0.04 * monoPaths(k) + conflict(k, p) * 0.8)
  const prodMf = (k: number) => 1 / (1 + 0.04 * mfPaths(k) + conflict(2, p) * 0.3 + 0.08) // +8% fixed MF overhead

  const N = 20, W = 560, H = 260, pad = 36
  const xs = Array.from({ length: N }, (_, i) => i + 1)
  const out = (f: (k: number) => number) => xs.map((k) => k * f(k))
  const mono = out(prodMono), mf = out(prodMf)
  const max = Math.max(...mf, ...mono)
  const pt = (k: number, v: number) => `${pad + ((k - 1) / (N - 1)) * (W - pad * 2)},${H - pad - (v / max) * (H - pad * 2)}`
  const path = (arr: number[]) => arr.map((v, i) => (i ? 'L' : 'M') + pt(i + 1, v)).join(' ')
  const cross = xs.find((k) => mf[k - 1] > mono[k - 1]) ?? null

  return (
    <section id="teams" className="section">
      <div className="reveal">
        <div className="eyebrow">06 · Model: organisational scaling</div>
        <h2 className="h2">Where the <span className="grad">real advantage</span> appears</h2>
        <p className="lead">Micro-frontends are primarily an <b>organisational</b> pattern. As teams are added to a monolith, coordination grows quadratically (Brooks’s law, Conway’s law). Move the slider.</p>
      </div>
      <div className="grid2 reveal">
        <div className="card">
          <div className="q">
            <div className="q-head">Number of teams <span>{n}</span></div>
            <input id="teams-n" className="range" type="range" min={1} max={20} value={n} onChange={(e) => setN(+e.target.value)} />
          </div>
          <div className="q">
            <div className="q-head">Code overlap per sprint <span>{p}%</span></div>
            <input id="teams-p" className="range" type="range" min={1} max={30} value={p} onChange={(e) => setP(+e.target.value)} />
          </div>
          <table style={{ marginTop: 10 }}>
            <thead><tr><th>Metric</th><th>Monolith</th><th>MF</th></tr></thead>
            <tbody>
              <tr><td>Communication paths</td><td className="grad-mono"><b>{monoPaths(n)}</b></td><td className="grad"><b>{mfPaths(n)}</b></td></tr>
              <tr><td>Merge-conflict risk / team</td><td><b>{Math.round(conflict(n, p) * 100)}%</b></td><td><b>{Math.round(conflict(2, p) * 30)}%</b></td></tr>
              <tr><td>Effective output (team-equivalents)</td><td><b>{mono[n - 1].toFixed(1)}</b></td><td><b>{mf[n - 1].toFixed(1)}</b></td></tr>
              <tr><td>Release slots blocked by others</td><td><b>{n - 1}</b></td><td><b>0</b></td></tr>
            </tbody>
          </table>
        </div>
        <div className="card chart">
          <div className="legend"><span><i style={{ background: 'var(--mono)' }} />Monolith</span><span><i style={{ background: 'var(--mf)' }} />Micro-frontends</span><span><i style={{ background: '#475569' }} />Ideal (linear)</span></div>
          <svg viewBox={`0 0 ${W} ${H}`}>
            {[0.25, 0.5, 0.75, 1].map((f) => <line key={f} x1={pad} x2={W - pad} y1={H - pad - f * (H - pad * 2)} y2={H - pad - f * (H - pad * 2)} stroke="rgba(255,255,255,.06)" />)}
            <path d={path(xs.map((k) => Math.min(k, max)))} stroke="#475569" strokeDasharray="4 4" fill="none" />
            <path d={path(mono)} stroke="#f59e0b" strokeWidth={3} fill="none" />
            <path d={path(mf)} stroke="#7c83ff" strokeWidth={3} fill="none" />
            {cross && <g><line x1={pt(cross, 0).split(',')[0]} x2={pt(cross, 0).split(',')[0]} y1={pad} y2={H - pad} stroke="#22c55e" strokeDasharray="3 3" />
              <text x={+pt(cross, 0).split(',')[0] + 6} y={pad + 12} fill="#22c55e" fontSize={11}>break-even ≈ {cross} teams</text></g>}
            <line x1={pt(n, 0).split(',')[0]} x2={pt(n, 0).split(',')[0]} y1={pad} y2={H - pad} stroke="#fff" opacity={0.3} />
            <circle cx={pt(n, mono[n - 1]).split(',')[0]} cy={pt(n, mono[n - 1]).split(',')[1]} r={6} fill="#f59e0b" />
            <circle cx={pt(n, mf[n - 1]).split(',')[0]} cy={pt(n, mf[n - 1]).split(',')[1]} r={6} fill="#7c83ff" />
            <text x={W / 2} y={H - 6} textAnchor="middle" fill="#8b93a7" fontSize={11}>teams →</text>
            <text x={10} y={pad - 10} fill="#8b93a7" fontSize={11}>effective output</text>
          </svg>
          <p className="muted" style={{ fontSize: 13, margin: '8px 0 0' }}>
            With 1–{(cross ?? 2) - 1} teams the monolith wins (no federation overhead). Beyond the break-even point the monolith’s
            output plateaus while micro-frontends keep scaling near-linearly.
          </p>
        </div>
      </div>
    </section>
  )
}
