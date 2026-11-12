import { useEffect, useState } from 'react'
import { labApi, type RemoteStatus } from '../labApi'

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
  const [remotes, setRemotes] = useState<Record<string, RemoteStatus> | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [apiErr, setApiErr] = useState<string | null>(null)
  const mfUp = useReachable('http://localhost:5200/', nonce)
  const monoUp = useReachable('http://localhost:5300/', nonce)

  const refreshRemotes = () =>
    labApi
      .remotes()
      .then(setRemotes)
      .catch(() => setRemotes(null))

  useEffect(() => {
    refreshRemotes()
    const t = setInterval(refreshRemotes, 4000)
    return () => clearInterval(t)
  }, [])

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
  const apply = () => {
    setStatus({ mf: [], mono: false })
    setNonce((n) => n + 1)
  }
  useEffect(apply, [fail]) // eslint-disable-line react-hooks/exhaustive-deps

  const controlRemote = async (name: string, action: 'stop' | 'start') => {
    setBusy(`${action}:${name}`)
    setApiErr(null)
    try {
      const r = action === 'stop' ? await labApi.stop(name) : await labApi.start(name)
      setRemotes(r.remotes)
      setNonce((n) => n + 1)
    } catch (e) {
      setApiErr(String((e as Error).message || e) + ' — запустіть lab-control (:5111)')
    } finally {
      setBusy(null)
    }
  }

  const q = fail.length ? `?fail=${fail.join(',')}` : ''
  const shopModules = MODULES.filter((m) => m !== 'checkout')
  const networkDown = MODULES.filter((m) => remotes && remotes[m] && !remotes[m].up)
  const mfFailCount = new Set([...fail.filter((f) => f !== 'checkout'), ...networkDown.filter((m) => m !== 'checkout')]).size
  const mfAvail = Math.round(((shopModules.length - Math.min(mfFailCount, shopModules.length)) / shopModules.length) * 100)
  const monoAvail = fail.some((f) => f !== 'checkout') ? 0 : 100

  const frame = (arch: 'mf' | 'monolith', port: number, up: boolean | null) => (
    <div className="frame">
      <div className="frame-bar">
        <i /><i /><i />
        <span className="url">localhost:{port}/{q}</span>
        <span className={`tag ${arch === 'mf' ? '' : 'mono'}`}>{arch === 'mf' ? 'Мікрофронтенди' : 'Моноліт'}</span>
      </div>
      {up === false ? (
        <div className="offline">
          <div>
            Сервер на :{port} не запущений.
            <code>npm start</code>
          </div>
        </div>
      ) : (
        <iframe key={`${arch}-${nonce}`} title={arch} src={`http://localhost:${port}/${q}`} />
      )}
      <div className="frame-status">
        Доступність магазину:
        <span
          className="avail"
          style={{
            color: (arch === 'mf' ? mfAvail : monoAvail) === 100 ? '#22c55e' : (arch === 'mf' ? mfAvail : monoAvail) > 0 ? '#f59e0b' : '#ef4444',
          }}
        >
          {arch === 'mf' ? mfAvail : monoAvail}%
        </span>
        <span className="muted" style={{ marginLeft: 'auto', color: '#8b97a5' }}>
          {arch === 'mf'
            ? status.mf.length || networkDown.length
              ? `ізольовано: ${[...status.mf, ...networkDown].filter((v, i, a) => a.indexOf(v) === i).join(', ')}`
              : 'усі межі здорові'
            : status.mono
              ? 'увесь застосунок впав'
              : 'працює'}
        </span>
      </div>
    </div>
  )

  return (
    <section id="arena" className="section">
      <div className="reveal">
        <div className="eyebrow">04 · Результати досліджень · ізоляція збоїв</div>
        <h2 className="h2">
          Chaos <span className="mf">Arena</span>
        </h2>
        <p className="lead">
          Два експерименти поруч: інʼєкція runtime-збою в модуль і реальна мережева відмова remote (stop/start через
          lab-control). У моноліті дефект йде до кореня; у MF — лишається в межі слота.
        </p>
      </div>
      <div className="arena-controls reveal">
        <b style={{ fontSize: 14 }}>Ввести збій (код):</b>
        {MODULES.map((m) => (
          <div key={m} className={`toggle ${fail.includes(m) ? 'on' : ''}`} onClick={() => toggle(m)}>
            <span className="switch" /> {m}
          </div>
        ))}
        <button type="button" className="btn btn-sm" onClick={apply}>
          Перезавантажити обидва
        </button>
        <button type="button" className="btn btn-sm" onClick={() => setFail([])}>
          Скинути
        </button>
      </div>

      <div className="panel reveal" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          <b>Мережева відмова remote</b>
          <span className="muted" style={{ fontSize: 13 }}>
            lab-control :5111 · stop вбиває preview-процес на порті
          </span>
        </div>
        {apiErr && <div className="note warn" style={{ marginTop: 0 }}>{apiErr}</div>}
        <div className="arena-controls" style={{ marginBottom: 0 }}>
          {MODULES.map((m) => {
            const st = remotes?.[m]
            return (
              <div key={m} className="remote-chip">
                <span className={`dot ${st?.up ? 'ok' : 'bad'}`} />
                <b>{m}</b>
                <span className="muted">:{st?.port ?? '—'} · v{st?.version ?? '?'}</span>
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled={!!busy || !st?.up}
                  onClick={() => controlRemote(m, 'stop')}
                >
                  {busy === `stop:${m}` ? '…' : 'Stop'}
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled={!!busy || !!st?.up}
                  onClick={() => controlRemote(m, 'start')}
                >
                  {busy === `start:${m}` ? '…' : 'Start'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="frames reveal">
        {frame('monolith', 5300, monoUp)}
        {frame('mf', 5200, mfUp)}
      </div>
      <div className="panel reveal" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <b>Міжкадрова event bus</b>
          <span className="muted" style={{ fontSize: 13 }}>
            {log.length} подій · postMessage з обох застосунків
          </span>
        </div>
        <div className="buslog">
          {log.length === 0 && <span className="muted">Взаємодійте з магазинами (додати в кошик, пошук, відкрити товар)…</span>}
          {log.map((e, i) => (
            <div key={i}>
              <span className={`src-${e.arch}`}>{e.arch}</span>
              <span className="muted">{new Date(e.ts).toLocaleTimeString()}</span>
              <b>{e.source}</b>→ {e.type}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
