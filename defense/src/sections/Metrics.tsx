import { useEffect, useState } from 'react'
import { useMetrics, kb, sec, type BuildResult } from '../metrics'
import { labApi } from '../labApi'

function Bars({
  rows, value, fmt,
}: {
  rows: BuildResult[]
  value: (r: BuildResult) => number
  fmt: (n: number) => string
}) {
  const max = Math.max(...rows.map(value), 1)
  return (
    <div className="bars">
      {rows.map((r) => (
        <div key={r.name} className="bar-row">
          <span>{r.name}</span>
          <div className="bar-track">
            <div className={`bar-fill ${r.arch === 'mf' ? 'mf' : 'mono'}`} style={{ width: `${(value(r) / max) * 100}%` }} />
          </div>
          <span className="bar-val">{fmt(value(r))}</span>
        </div>
      ))}
    </div>
  )
}

type HistSnap = { measuredAt: string; results: { name: string; buildMs: number; gzipBytes: number }[] }

export function Metrics() {
  const m = useMetrics()
  const [history, setHistory] = useState<HistSnap[]>([])
  useEffect(() => {
    labApi
      .history()
      .then((r) => setHistory(r.history || []))
      .catch(async () => {
        try {
          const local = await fetch('/metrics-history.json')
          if (local.ok) setHistory(await local.json())
        } catch {
          /* empty */
        }
      })
  }, [m.measuredAt])

  const by = (n: string) => m.results.find((r) => r.name === n)!
  const mono = by('monolith')
  const shell = by('shell')
  const cat = by('catalog')
  const co = by('checkout')
  const rv = by('reviews')
  const remotes = [cat, co, rv]

  const avgRemoteBuild = remotes.reduce((s, r) => s + r.buildMs, 0) / remotes.length
  const buildGain = Math.round((1 - avgRemoteBuild / mono.buildMs) * 100)
  const mfTotal = [shell, ...remotes].reduce((s, r) => s + r.gzipBytes, 0)
  const checkoutUpdate = co.gzipBytes
  const cacheGain = Math.round((1 - checkoutUpdate / mono.gzipBytes) * 100)
  const overhead = Math.round((mfTotal / mono.gzipBytes - 1) * 100)

  return (
    <section id="metrics" className="section">
      <div className="reveal">
        <div className="eyebrow">05 · Результати досліджень · збірка і бандл</div>
        <h2 className="h2">
          Виміряно, <span className="mf">а не припущено</span>
        </h2>
        <p className="lead">
          З <code>npm run measure</code>: кожна деплоєва одиниця збирається кілька разів через Vite; фіксуються медіанний час збірки та gzip-розмір JS.
        </p>
      </div>
      {m.sample ? (
        <div className="note warn reveal">
          Показано <b>ілюстративні зразкові значення</b>. Запустіть <code>npm run measure</code>, щоб замінити їх реальними вимірами.
        </div>
      ) : (
        <div className="note reveal">
          Реальні дані виміряно {new Date(m.measuredAt!).toLocaleString()} · Node {m.node}
        </div>
      )}

      <div className="grid4 reveal" style={{ marginTop: '1.25rem' }}>
        <div className="panel kpi">
          <b className={buildGain >= 0 ? 'mf' : 'mono'}>
            {buildGain >= 0 ? '−' : '+'}
            {Math.abs(buildGain)}%
          </b>
          <span>
            середня збірка MF-одиниці vs повний моноліт
            {buildGain < 0 ? ' — старт інструментів домінує на такому малому масштабі' : ''}
          </span>
        </div>
        <div className="panel kpi">
          <b className="mf">−{cacheGain}%</b>
          <span>байтів повторного завантаження після релізу лише checkout</span>
        </div>
        <div className="panel kpi">
          <b className="mf">{sec(mono.buildMs)}</b>
          <span>збірка моноліту — платиться на кожній зміні</span>
        </div>
        <div className="panel kpi">
          <b className="mono">+{overhead}%</b>
          <span>загальний JS-оверхед MF (runtime + federation glue)</span>
        </div>
      </div>

      <div className="grid2 reveal" style={{ marginTop: '1.1rem' }}>
        <div className="panel">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Час збірки (медіана)</h3>
          <Bars rows={m.results} value={(r) => r.buildMs} fmt={sec} />
        </div>
        <div className="panel">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>JavaScript, gzip</h3>
          <Bars rows={m.results} value={(r) => r.gzipBytes} fmt={kb} />
        </div>
      </div>

      <div className="panel reveal" style={{ marginTop: '1.1rem' }}>
        <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Інтерпретація</h3>
        <div className="grid2">
          <ul className="check-list">
            <li>
              <span>
                Після зміни checkout користувачі знову завантажують ~{kb(checkoutUpdate)} замість ~{kb(mono.gzipBytes)}.
              </span>
            </li>
            <li>
              <span>Незалежні одиниці тримають CI зосередженим на зміненому remote, а не на всьому застосунку.</span>
            </li>
          </ul>
          <ul className="check-list x-list">
            <li>
              <span>MF платить податок на payload (узгодження спільного runtime + Vue у reviews).</span>
            </li>
            <li>
              <span>На крихітному масштабі холодний старт Vite може домінувати в часі збірки одиниці.</span>
            </li>
          </ul>
        </div>
      </div>

      {history.length > 0 && (
        <div className="panel reveal" style={{ marginTop: '1.1rem' }}>
          <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>
            Історія вимірів ({history.length})
          </h3>
          <p className="muted" style={{ fontSize: 0.88, marginTop: 0 }}>
            Кожен <code>npm run measure</code> додає зріз. Графік: gzip моноліту vs checkout remote.
          </p>
          <HistoryChart history={history} />
        </div>
      )}
    </section>
  )
}

function HistoryChart({ history }: { history: HistSnap[] }) {
  const W = 640
  const H = 200
  const pad = 28
  const pts = history.slice(-12)
  const mono = pts.map((h) => h.results.find((r) => r.name === 'monolith')?.gzipBytes ?? 0)
  const co = pts.map((h) => h.results.find((r) => r.name === 'checkout')?.gzipBytes ?? 0)
  const max = Math.max(...mono, ...co, 1)
  const x = (i: number) => pad + (pts.length <= 1 ? 0 : (i / (pts.length - 1)) * (W - pad * 2))
  const y = (v: number) => H - pad - (v / max) * (H - pad * 2)
  const path = (arr: number[]) => arr.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <path d={path(mono)} fill="none" stroke="#b45309" strokeWidth="2.5" />
      <path d={path(co)} fill="none" stroke="#0f766e" strokeWidth="2.5" />
      {pts.map((h, i) => (
        <g key={h.measuredAt + i}>
          <circle cx={x(i)} cy={y(mono[i])} r="3.5" fill="#b45309" />
          <circle cx={x(i)} cy={y(co[i])} r="3.5" fill="#0f766e" />
        </g>
      ))}
      <text x={pad} y={16} fill="#5c6b7a" fontSize="11">
        monolith gzip (copper) · checkout gzip (teal)
      </text>
    </svg>
  )
}
