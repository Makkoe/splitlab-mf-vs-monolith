import { useMetrics, kb, sec, type BuildResult } from '../metrics'

function Bars({ rows, value, fmt }: { rows: BuildResult[]; value: (r: BuildResult) => number; fmt: (n: number) => string }) {
  const max = Math.max(...rows.map(value))
  return (
    <div className="bars">
      {rows.map((r) => (
        <div key={r.name} className="bar-row">
          <span>{r.name}</span>
          <div className="bar-track"><div className={`bar-fill ${r.arch === 'mf' ? 'mf' : 'mono'}`} style={{ width: `${(value(r) / max) * 100}%` }} /></div>
          <span className="bar-val">{fmt(value(r))}</span>
        </div>
      ))}
    </div>
  )
}

export function Metrics() {
  const m = useMetrics()
  const by = (n: string) => m.results.find((r) => r.name === n)!
  const mono = by('monolith'), shell = by('shell'), cat = by('catalog'), co = by('checkout'), rv = by('reviews')
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
        <div className="eyebrow">04 · Experiment: build & bundle metrics</div>
        <h2 className="h2">Measured, <span className="grad">not assumed</span></h2>
        <p className="lead">
          Produced by <code>npm run measure</code>: every deployable unit is built {m.sample ? 'N' : (m as any).runs ?? 3} times with Vite;
          the median build time and raw / gzip JavaScript size are recorded.
        </p>
      </div>
      {m.sample
        ? <div className="note warn reveal" style={{ marginBottom: 24 }}>⚠️ Showing <b>illustrative sample values</b>. Run <code>npm run measure</code> to replace them with real measurements from your machine.</div>
        : <div className="note reveal" style={{ marginBottom: 24 }}>✔ Real data measured {new Date(m.measuredAt!).toLocaleString()} · Node {(m as any).node}</div>}

      <div className="grid4 reveal">
        <div className="card kpi"><b className={buildGain >= 0 ? 'grad' : 'grad-mono'}>{buildGain >= 0 ? '−' : '+'}{Math.abs(buildGain)}%</b><span>avg MF unit build vs full monolith build{buildGain < 0 ? ' — fixed tool start-up dominates at this small scale' : ''}</span></div>
        <div className="card kpi"><b className="grad">−{cacheGain}%</b><span>bytes users re-download after a checkout release (cache invalidation scope)</span></div>
        <div className="card kpi"><b className="grad">{sec(mono.buildMs)}</b><span>monolith build — paid on <i>every</i> change</span></div>
        <div className="card kpi"><b className="grad-mono">+{overhead}%</b><span>total JS overhead of MF (runtime + duplicated vue/federation glue)</span></div>
      </div>

      <div className="grid2 reveal" style={{ marginTop: 20 }}>
        <div className="card"><h3 style={{ marginTop: 0 }}>⏱ Build time (median)</h3><Bars rows={m.results} value={(r) => r.buildMs} fmt={sec} /></div>
        <div className="card"><h3 style={{ marginTop: 0 }}>📦 JavaScript, gzip</h3><Bars rows={m.results} value={(r) => r.gzipBytes} fmt={kb} /></div>
      </div>

      <div className="card reveal" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>Interpretation</h3>
        <div className="grid2">
          <ul className="check-list">
            <li>A change in one domain rebuilds only that unit — feedback loops shrink and CI cost scales with the change, not the codebase.</li>
            <li>Releasing checkout invalidates only {kb(checkoutUpdate)} in browser caches instead of the whole {kb(mono.gzipBytes)} bundle.</li>
            <li>Checkout code is not downloaded until the user navigates to it (route-level lazy remote).</li>
          </ul>
          <ul className="check-list x-list">
            <li>Total bytes are higher: federation runtime and per-remote framework copies (Vue is not shared) add overhead.</li>
            <li>Extra network round-trips for <code>remoteEntry.js</code>; mitigated with preloading/HTTP/2.</li>
            <li>At this small scale the monolith is still competitive — benefits grow with codebase and team size.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
