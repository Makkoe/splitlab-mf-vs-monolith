import { useState } from 'react'

export function Teams() {
  const [n, setN] = useState(6)
  const [p, setP] = useState(8)

  const monoPaths = (k: number) => (k * (k - 1)) / 2
  const mfPaths = (k: number) => Math.max(0, k - 1)
  const conflict = (k: number, pp: number) => 1 - Math.pow(1 - pp / 100, k - 1)
  const prodMono = (k: number) => 1 / (1 + 0.04 * monoPaths(k) + conflict(k, p) * 0.8)
  const prodMf = (k: number) => 1 / (1 + 0.04 * mfPaths(k) + conflict(2, p) * 0.3 + 0.08)

  const N = 20
  const W = 560
  const H = 260
  const pad = 36
  const xs = Array.from({ length: N }, (_, i) => i + 1)
  const out = (f: (k: number) => number) => xs.map((k) => k * f(k))
  const mono = out(prodMono)
  const mf = out(prodMf)
  const max = Math.max(...mf, ...mono)
  const pt = (k: number, v: number) =>
    `${pad + ((k - 1) / (N - 1)) * (W - pad * 2)},${H - pad - (v / max) * (H - pad * 2)}`
  const path = (arr: number[]) => arr.map((v, i) => (i ? 'L' : 'M') + pt(i + 1, v)).join(' ')
  const cross = xs.find((k) => mf[k - 1] > mono[k - 1]) ?? null

  return (
    <section id="teams" className="section">
      <div className="reveal">
        <div className="eyebrow">06b · Результати досліджень · організаційне масштабування</div>
        <h2 className="h2">
          Де зʼявляється <span className="mf">реальна перевага</span>
        </h2>
        <p className="lead">
          Мікрофронтенди — передусім <b>організаційний</b> патерн. Коли команди приєднуються до моноліту, координація зростає
          квадратично (закон Брукса, закон Конвея). Рухайте повзунок.
        </p>
      </div>
      <div className="grid2 reveal">
        <div className="panel">
          <div className="q">
            <div className="q-head">
              Кількість команд <span>{n}</span>
            </div>
            <input className="range" type="range" min={1} max={20} value={n} onChange={(e) => setN(+e.target.value)} />
          </div>
          <div className="q">
            <div className="q-head">
              Перетин коду за спринт <span>{p}%</span>
            </div>
            <input className="range" type="range" min={1} max={30} value={p} onChange={(e) => setP(+e.target.value)} />
          </div>
          <div className="table-wrap" style={{ marginTop: 10, border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Метрика</th>
                  <th>Моноліт</th>
                  <th>MF</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Шляхи комунікації</td>
                  <td className="mono">
                    <b>{monoPaths(n)}</b>
                  </td>
                  <td className="mf">
                    <b>{mfPaths(n)}</b>
                  </td>
                </tr>
                <tr>
                  <td>Ризик merge-конфліктів / команда</td>
                  <td>
                    <b>{Math.round(conflict(n, p) * 100)}%</b>
                  </td>
                  <td>
                    <b>{Math.round(conflict(2, p) * 30)}%</b>
                  </td>
                </tr>
                <tr>
                  <td>Ефективний вихід (еквіваленти команд)</td>
                  <td>
                    <b>{mono[n - 1].toFixed(1)}</b>
                  </td>
                  <td>
                    <b>{mf[n - 1].toFixed(1)}</b>
                  </td>
                </tr>
                <tr>
                  <td>Слоти релізу, заблоковані іншими</td>
                  <td>
                    <b>{n - 1}</b>
                  </td>
                  <td>
                    <b>0</b>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel chart">
          <div className="legend">
            <span>
              <i style={{ background: 'var(--mono)' }} />
              Моноліт
            </span>
            <span>
              <i style={{ background: 'var(--mf)' }} />
              Мікрофронтенди
            </span>
            <span>
              <i style={{ background: '#94a3b8' }} />
              Ідеал (лінійно)
            </span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`}>
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <line
                key={f}
                x1={pad}
                x2={W - pad}
                y1={H - pad - f * (H - pad * 2)}
                y2={H - pad - f * (H - pad * 2)}
                stroke="rgba(16,24,32,.08)"
              />
            ))}
            <path d={path(xs.map((k) => Math.min(k, max)))} stroke="#94a3b8" strokeDasharray="4 4" fill="none" />
            <path d={path(mono)} stroke="#b45309" strokeWidth={3} fill="none" />
            <path d={path(mf)} stroke="#0f766e" strokeWidth={3} fill="none" />
            {cross && (
              <g>
                <line
                  x1={pt(cross, 0).split(',')[0]}
                  x2={pt(cross, 0).split(',')[0]}
                  y1={pad}
                  y2={H - pad}
                  stroke="#15803d"
                  strokeDasharray="3 3"
                />
                <text x={+pt(cross, 0).split(',')[0] + 6} y={pad + 12} fill="#15803d" fontSize={11}>
                  break-even ≈ {cross} команд
                </text>
              </g>
            )}
            <line x1={pt(n, 0).split(',')[0]} x2={pt(n, 0).split(',')[0]} y1={pad} y2={H - pad} stroke="#101820" opacity={0.25} />
            <circle cx={pt(n, mono[n - 1]).split(',')[0]} cy={pt(n, mono[n - 1]).split(',')[1]} r={6} fill="#b45309" />
            <circle cx={pt(n, mf[n - 1]).split(',')[0]} cy={pt(n, mf[n - 1]).split(',')[1]} r={6} fill="#0f766e" />
            <text x={W / 2} y={H - 6} textAnchor="middle" fill="#5c6b7a" fontSize={11}>
              команди →
            </text>
            <text x={10} y={pad - 10} fill="#5c6b7a" fontSize={11}>
              ефективний вихід
            </text>
          </svg>
          <p className="muted" style={{ fontSize: 13, margin: '8px 0 0' }}>
            З 1–{(cross ?? 2) - 1} командами моноліт виграє (немає оверхеду federation). Після точки break-even вихід моноліту
            виходить на плато, тоді як мікрофронтенди масштабуються майже лінійно.
          </p>
        </div>
      </div>
    </section>
  )
}
