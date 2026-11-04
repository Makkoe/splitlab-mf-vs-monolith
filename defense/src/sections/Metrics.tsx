import { useMetrics, kb, sec, type BuildResult } from '../metrics'

function Bars({
  rows, value, fmt,
}: {
  rows: BuildResult[]
  value: (r: BuildResult) => number
  fmt: (n: number) => string
}) {
  const max = Math.max(...rows.map(value))
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

export function Metrics() {
  const m = useMetrics()
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
    </section>
  )
}
