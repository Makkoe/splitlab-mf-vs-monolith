import { useRef, useState } from 'react'
import { useMetrics, sec } from '../metrics'

const MODS = ['catalog', 'checkout', 'reviews'] as const
type Mod = typeof MODS[number]

/**
 * Deployment model. Build stage uses real measured build times (or sample values);
 * other stages are parametrised assumptions, shown openly in the UI.
 */
const TEST_PER_MODULE = 1.6 // s of tests per module (assumption)
const DEPLOY = 2.0 // s upload + CDN invalidation (assumption)
const COORD = 3.0 // s release coordination/approval per affected team in monolith (assumption)

export function Deploy() {
  const m = useMetrics()
  const [mod, setMod] = useState<Mod>('checkout')
  const [run, setRun] = useState(0)
  const [prog, setProg] = useState({ mono: 0, mf: 0 })
  const raf = useRef(0)

  const b = (n: string) => m.results.find((r) => r.name === n)!.buildMs / 1000
  const monoStages = [
    ['Coordinate release', COORD * MODS.length], ['Run all tests', TEST_PER_MODULE * MODS.length],
    ['Build whole app', b('monolith')], ['Deploy bundle', DEPLOY],
  ] as const
  const mfStages = [
    ['Coordinate release', 0], [`Test ${mod}`, TEST_PER_MODULE],
    [`Build ${mod}`, b(mod)], ['Deploy remote', DEPLOY],
  ] as const
  const monoT = monoStages.reduce((s, [, t]) => s + t, 0)
  const mfT = mfStages.reduce((s, [, t]) => s + t, 0)

  const start = () => {
    cancelAnimationFrame(raf.current)
    setRun((r) => r + 1)
    const t0 = performance.now()
    const speed = 4 // 1 real s = 4 simulated s
    const tick = () => {
      const t = ((performance.now() - t0) / 1000) * speed
      setProg({ mono: Math.min(t, monoT), mf: Math.min(t, mfT) })
      if (t < monoT) raf.current = requestAnimationFrame(tick)
    }
    tick()
  }

  const Pipe = ({ stages, p, cls }: { stages: readonly (readonly [string, number])[]; p: number; cls: string }) => {
    let acc = 0
    return (
      <div className="pipe">
        {stages.map(([n, t]) => {
          const pct = t === 0 ? (run ? 100 : 0) : Math.max(0, Math.min(1, (p - acc) / t)) * 100
          acc += t
          return (
            <div key={n} className="stage">
              <span>{n}</span>
              <div className="stage-track"><div className={`stage-fill bar-fill ${cls}`} style={{ width: `${pct}%`, transition: 'none' }} /></div>
              <span className="bar-val">{t === 0 ? 'skip' : t.toFixed(1) + 's'}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <section id="deploy" className="section">
      <div className="reveal">
        <div className="eyebrow">05 · Simulation: independent deployment</div>
        <h2 className="h2">Ship one fix — <span className="grad">how much moves?</span></h2>
        <p className="lead">Choose which team pushed a change. The monolith must coordinate, test, build and redeploy everything; the micro-frontend pipeline touches only the affected unit.</p>
      </div>
      <div className="card reveal">
        <div className="arena-controls" style={{ marginBottom: 0 }}>
          <b style={{ fontSize: 14 }}>Changed module:</b>
          {MODS.map((x) => <div key={x} id={`deploy-${x}`} className={`toggle ${mod === x ? 'on' : ''}`} style={mod === x ? { borderColor: 'var(--mf)', background: 'rgba(124,131,255,.12)' } : {}} onClick={() => { setMod(x); setProg({ mono: 0, mf: 0 }); setRun(0) }}>{x}</div>)}
          <button id="deploy-run" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={start}>▶ Run pipelines</button>
        </div>
      </div>
      <div className="grid2 reveal" style={{ marginTop: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><h3 className="grad-mono" style={{ margin: 0 }}>Monolith pipeline</h3><span className="big-num grad-mono">{prog.mono.toFixed(1)}s</span></div>
          <div className="mods">{MODS.map((x) => <span key={x} className="mod hit">{x}</span>)}<span className="muted" style={{ fontSize: 13, alignSelf: 'center' }}>blast radius: 100%</span></div>
          <Pipe stages={monoStages} p={prog.mono} cls="mono" />
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}><h3 className="grad" style={{ margin: 0 }}>Micro-frontend pipeline</h3><span className="big-num grad">{prog.mf.toFixed(1)}s</span></div>
          <div className="mods">{MODS.map((x) => <span key={x} className={`mod ${x === mod ? 'hit-mf' : ''}`}>{x}</span>)}<span className="muted" style={{ fontSize: 13, alignSelf: 'center' }}>blast radius: {Math.round(100 / MODS.length)}%</span></div>
          <Pipe stages={mfStages} p={prog.mf} cls="mf" />
        </div>
      </div>
      <div className="grid3 reveal" style={{ marginTop: 20 }}>
        <div className="card kpi"><b className="grad">{(monoT / mfT).toFixed(1)}×</b><span>faster lead time for change</span></div>
        <div className="card kpi"><b className="grad">{Math.round(86400 / mfT / 60)}</b><span>theoretical releases/day per team (vs {Math.round(86400 / monoT / 60)} shared)</span></div>
        <div className="card kpi"><b className="grad">0</b><span>other teams blocked during release</span></div>
      </div>
      <div className="note reveal">Model: build = measured ({sec(b('monolith') * 1000)} monolith vs {sec(b(mod) * 1000)} {mod}); tests {TEST_PER_MODULE}s/module, deploy {DEPLOY}s, coordination {COORD}s per team — assumptions scaled down for visualisation. Maps to DORA metrics: <i>lead time for changes</i> and <i>deployment frequency</i>.</div>
    </section>
  )
}
