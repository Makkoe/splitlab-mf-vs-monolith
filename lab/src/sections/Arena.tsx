import { useEffect, useState } from 'react'

const MODULES = ['catalog', 'reviews', 'checkout'] as const
interface Ev { source: string; type: string; ts: number; arch: 'mf' | 'monolith' }

function useReachable(url: string, tick: number) {
  const [ok, setOk] = useState<boolean | null>(null)
  useEffect(() => {
    fetch(url, { mode: 'no-cors' }).then(() => setOk(true)).catch(() => setOk(false))
  }, [url, tick])
  return ok
}

export function Arena() {
  const [fail, setFail] = useState<string[]>([])
  const [nonce, setNonce] = useState(0)
  const [log, setLog] = useState<Ev[]>([])
  const [status, setStatus] = useState<{ mf: string[]; mono: boolean }>({ mf: [], mono: false })
  const mfUp = useReachable('http://localhost:5200/', nonce)
  const monoUp = useReachable('http://localhost:5300/', nonce)

  useEffect(() => {
    const h = (e: MessageEvent) => {
      if (!e.data?.__mfbus) return
      const arch = e.origin.includes('5300') ? 'monolith' : 'mf'
      setLog((l) => [{ source: e.data.source, type: e.data.type, ts: e.data.ts, arch } as Ev, ...l].slice(0, 60))
      if (e.data.type === 'module:failed') setStatus((s) => ({ ...s, mf: [...new Set([...s.mf, e.data.detail.module])] }))
      if (e.data.type === 'app:crashed') setStatus((s) => ({ ...s, mono: true }))
    }
    window.addEventListener('message', h)
    return () => window.removeEventListener('message', h)
  }, [])

  const toggle = (m: string) => setFail((f) => (f.includes(m) ? f.filter((x) => x !== m) : [...f, m]))
  const apply = () => { setStatus({ mf: [], mono: false }); setNonce((n) => n + 1) }
  useEffect(apply, [fail]) // eslint-disable-line react-hooks/exhaustive-deps

  const q = fail.length ? `?fail=${fail.join(',')}` : ''
  // Availability on the shop page: catalog + reviews visible (checkout is a separate route)
  const shopModules = MODULES.filter((m) => m !== 'checkout')
  const mfAvail = Math.round(((shopModules.length - fail.filter((f) => f !== 'checkout').length) / shopModules.length) * 100)
  const monoAvail = fail.some((f) => f !== 'checkout') ? 0 : 100

  const frame = (arch: 'mf' | 'monolith', port: number, up: boolean | null) => (
    <div className="frame">
      <div className="frame-bar"><i /><i /><i /><span className="url">localhost:{port}/{q}</span>
        <span className={`tag ${arch === 'mf' ? '' : 'mono'}`}>{arch === 'mf' ? 'Micro-frontends' : 'Monolith'}</span></div>
      {up === false
        ? <div className="offline"><div>🔌 Server on :{port} is not running.<code>npm start</code></div></div>
        : <iframe key={`${arch}-${nonce}`} title={arch} src={`http://localhost:${port}/${q}`} />}
      <div className="frame-status">
        Shop availability:
        <span className="avail" style={{ color: (arch === 'mf' ? mfAvail : monoAvail) === 100 ? '#22c55e' : (arch === 'mf' ? mfAvail : monoAvail) > 0 ? '#f59e0b' : '#ef4444' }}>
          {arch === 'mf' ? mfAvail : monoAvail}%
        </span>
        <span className="muted" style={{ marginLeft: 'auto' }}>
          {arch === 'mf'
            ? (status.mf.length ? `isolated: ${status.mf.join(', ')}` : 'all boundaries healthy')
            : (status.mono ? 'entire app crashed' : 'running')}
        </span>
      </div>
    </div>
  )

  return (
    <section id="arena" className="section">
      <div className="reveal">
        <div className="eyebrow">03 · Experiment: fault isolation</div>
        <h2 className="h2">Live <span className="grad">Chaos Arena</span></h2>
        <p className="lead">
          Both storefronts run side by side. Inject a runtime failure into any module and watch the outcome. In the monolith a single
          defect propagates to the root; in the micro-frontend shell it is contained by the module's boundary.
          Try also <b>stopping a remote server</b> (e.g. close <code>reviews :5203</code>) — a real network failure.
        </p>
      </div>
      <div className="arena-controls">
        <b style={{ fontSize: 14 }}>Inject failure:</b>
        {MODULES.map((m) => (
          <div key={m} id={`fail-${m}`} className={`toggle ${fail.includes(m) ? 'on' : ''}`} onClick={() => toggle(m)}>
            <span className="switch" /> {m}
          </div>
        ))}
        <button id="arena-reload" className="btn btn-sm" onClick={apply}>↻ Reload both</button>
        <button className="btn btn-sm" onClick={() => setFail([])}>Reset</button>
      </div>
      <div className="frames">
        {frame('monolith', 5300, monoUp)}
        {frame('mf', 5200, mfUp)}
      </div>
      <div className="card" style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <b>📡 Cross-frame event bus monitor</b><span className="muted" style={{ fontSize: 13 }}>{log.length} events · postMessage from both apps</span>
        </div>
        <div className="buslog">
          {log.length === 0 && <span className="muted">Interact with the stores (add to cart, click a product, search)…</span>}
          {log.map((e, i) => (
            <div key={i}><span className={`src-${e.arch}`}>{e.arch}</span><span className="muted">{new Date(e.ts).toLocaleTimeString()}</span><b>{e.source}</b>→ {e.type}</div>
          ))}
        </div>
      </div>
    </section>
  )
}
