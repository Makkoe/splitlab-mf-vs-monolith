import { useEffect, useState } from 'react'
import { kb } from '../labApi'
import { labApi } from '../labApi'

type Probe = {
  mode: 'mf' | 'monolith'
  ts: number
  domContentLoadedMs: number | null
  loadEventMs: number | null
  transferBytes: number
  encodedBytes: number
  jsFiles: number
  modules: Record<string, { version: string; framework: string; mountMs: number }>
  chunks: { name: string; transferSize: number; duration: number }[]
}

type BundleUnit = { name: string; arch: string; totalBytes: number; files: { name: string; bytes: number }[] }

export function Runtime() {
  const [probes, setProbes] = useState<{ mf?: Probe; mono?: Probe }>({})
  const [bundle, setBundle] = useState<BundleUnit[]>([])
  const [hint, setHint] = useState('Відкрийте Arena (iframe :5200 / :5300) — вітрини надішлють Performance Timing сюди.')

  useEffect(() => {
    const h = (e: MessageEvent) => {
      if (!e.data?.__mfruntime) return
      const p = e.data as Probe
      setProbes((prev) => ({ ...prev, [p.mode === 'mf' ? 'mf' : 'mono']: p }))
      setHint('Отримано runtime-проби з вітрин.')
    }
    window.addEventListener('message', h)
    labApi
      .bundleMap()
      .then((r) => setBundle(r.units))
      .catch(() => {})
    return () => window.removeEventListener('message', h)
  }, [])

  const Card = ({ title, cls, p }: { title: string; cls: string; p?: Probe }) => (
    <div className="panel">
      <h3 className={cls} style={{ marginTop: 0, fontFamily: 'var(--display)' }}>
        {title}
      </h3>
      {!p ? (
        <p className="muted" style={{ margin: 0 }}>
          Немає даних — перезавантажте iframe у Arena.
        </p>
      ) : (
        <>
          <div className="grid2" style={{ gap: '0.6rem' }}>
            <div className="kpi">
              <b className={cls}>{p.domContentLoadedMs ?? '—'} ms</b>
              <span>DOMContentLoaded</span>
            </div>
            <div className="kpi">
              <b className={cls}>{p.loadEventMs ?? '—'} ms</b>
              <span>load event</span>
            </div>
            <div className="kpi">
              <b className={cls}>{kb(p.transferBytes)}</b>
              <span>JS transferSize (мережа)</span>
            </div>
            <div className="kpi">
              <b className={cls}>{p.jsFiles}</b>
              <span>JS-ресурсів у Performance API</span>
            </div>
          </div>
          {Object.keys(p.modules).length > 0 && (
            <div style={{ marginTop: '0.85rem' }}>
              <b style={{ fontSize: 13 }}>Mount модулів</b>
              <div className="buslog">
                {Object.entries(p.modules).map(([name, m]) => (
                  <div key={name}>
                    <b>{name}</b>
                    <span className="muted">
                      v{m.version} · {m.framework}
                    </span>
                    <span>{m.mountMs} ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {p.chunks.length > 0 && (
            <div style={{ marginTop: '0.85rem' }}>
              <b style={{ fontSize: 13 }}>Топ JS-чанки (Web Vitals / Resource Timing)</b>
              <div className="buslog">
                {p.chunks.slice(0, 8).map((c) => (
                  <div key={c.name + c.transferSize}>
                    <code>{c.name}</code>
                    <span>{kb(c.transferSize)}</span>
                    <span className="muted">{c.duration} ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )

  return (
    <section id="runtime" className="section">
      <div className="reveal">
        <div className="eyebrow">05b · Результати досліджень · runtime</div>
        <h2 className="h2">
          Cold load і <span className="mf">мережеві байти</span>
        </h2>
        <p className="lead">
          Вітрини самі знімають Performance Navigation/Resource Timing і шлють у лабораторію. Це доповнює build/gzip
          метрики реальними цифрами браузера. Нижче — також карта зібраних JS-артефактів на диску.
        </p>
      </div>
      <div className="note reveal">{hint}</div>
      <div className="grid2 reveal" style={{ marginTop: '1rem' }}>
        <Card title="Мікрофронтенди (:5200)" cls="mf" p={probes.mf} />
        <Card title="Моноліт (:5300)" cls="mono" p={probes.mono} />
      </div>

      {bundle.length > 0 && (
        <div className="panel reveal" style={{ marginTop: '1.1rem' }}>
          <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Bundle map (dist на диску)</h3>
          <div className="grid2">
            {bundle.map((u) => (
              <div key={u.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <b className={u.arch === 'mf' ? 'mf' : 'mono'}>{u.name}</b>
                  <span className="muted">{kb(u.totalBytes)}</span>
                </div>
                <div className="bars">
                  {u.files.slice(0, 5).map((f) => (
                    <div key={f.name} className="bar-row" style={{ gridTemplateColumns: '1fr 80px' }}>
                      <code style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</code>
                      <span className="bar-val">{kb(f.bytes)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="muted" style={{ fontSize: 13, margin: '0.75rem 0 0' }}>
            Для remotes «важкі» shared-fallback файли часто лежать у dist, але в браузері не качаються повторно, якщо
            shell уже віддав singleton React — порівнюйте з runtime transferSize вище.
          </p>
        </div>
      )}
    </section>
  )
}
