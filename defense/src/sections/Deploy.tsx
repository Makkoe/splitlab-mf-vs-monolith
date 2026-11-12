import { useEffect, useRef, useState } from 'react'
import { useMetrics, sec } from '../metrics'
import { labApi } from '../labApi'

const MODS = ['catalog', 'checkout', 'reviews'] as const
type Mod = typeof MODS[number]

const TEST_PER_MODULE = 1.6
const DEPLOY = 2.0
const COORD = 3.0

type ReleaseResult = Awaited<ReturnType<typeof labApi.release>>

export function Deploy() {
  const m = useMetrics()
  const [mod, setMod] = useState<Mod>('checkout')
  const [run, setRun] = useState(0)
  const [prog, setProg] = useState({ mono: 0, mf: 0 })
  const [releasing, setReleasing] = useState(false)
  const [release, setRelease] = useState<ReleaseResult | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [versions, setVersions] = useState<Record<string, string>>({})
  const raf = useRef(0)

  const refreshVersions = () =>
    labApi
      .remotes()
      .then((r) => setVersions(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.version]))))
      .catch(() => {})

  useEffect(() => {
    refreshVersions()
  }, [])

  const b = (n: string) => m.results.find((r) => r.name === n)!.buildMs / 1000
  const monoStages = [
    ['Координація релізу', COORD * MODS.length],
    ['Запуск усіх тестів', TEST_PER_MODULE * MODS.length],
    ['Збірка всього застосунку', b('monolith')],
    ['Деплой бандла', DEPLOY],
  ] as const
  const mfStages = [
    ['Координація релізу', 0],
    [`Тест ${mod}`, TEST_PER_MODULE],
    [`Збірка ${mod}`, b(mod)],
    ['Деплой remote', DEPLOY],
  ] as const
  const monoT = monoStages.reduce((s, [, t]) => s + t, 0)
  const mfT = mfStages.reduce((s, [, t]) => s + t, 0)

  const start = () => {
    cancelAnimationFrame(raf.current)
    setRun((r) => r + 1)
    const t0 = performance.now()
    const speed = 4
    const tick = () => {
      const t = ((performance.now() - t0) / 1000) * speed
      setProg({ mono: Math.min(t, monoT), mf: Math.min(t, mfT) })
      if (t < monoT) raf.current = requestAnimationFrame(tick)
    }
    tick()
  }

  const doRelease = async () => {
    setReleasing(true)
    setErr(null)
    try {
      const r = await labApi.release(mod)
      setRelease(r)
      refreshVersions()
    } catch (e) {
      setErr(String((e as Error).message || e) + ' — потрібен lab-control на :5111 і зібрані remotes')
    } finally {
      setReleasing(false)
    }
  }

  const Pipe = ({
    stages, p, cls,
  }: {
    stages: readonly (readonly [string, number])[]
    p: number
    cls: string
  }) => {
    let acc = 0
    return (
      <div className="pipe">
        {stages.map(([n, t]) => {
          const pct = t === 0 ? (run ? 100 : 0) : Math.max(0, Math.min(1, (p - acc) / t)) * 100
          acc += t
          return (
            <div key={n} className="stage">
              <span>{n}</span>
              <div className="stage-track">
                <div className={`stage-fill bar-fill ${cls}`} style={{ width: `${pct}%`, transition: 'none' }} />
              </div>
              <span className="bar-val">{t === 0 ? 'skip' : `${t.toFixed(1)}s`}</span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <section id="deploy" className="section">
      <div className="reveal">
        <div className="eyebrow">06 · Результати досліджень · незалежний деплой</div>
        <h2 className="h2">
          Випустити одне виправлення — <span className="mf">скільки рухається?</span>
        </h2>
        <p className="lead">
          Нижче дві частини: (1) модель пайплайну з виміряними build-часами; (2) <b>реальний</b> незалежний реліз
          remote — bump версії, vite build лише цього модуля, restart preview. Shell і monolith не перезбираються.
        </p>
      </div>

      <div className="panel reveal" style={{ marginBottom: '1.1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <div>
            <b>Живий незалежний реліз</b>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              Поточні версії:{' '}
              {MODS.map((x) => (
                <span key={x} style={{ marginRight: 10 }}>
                  {x} <code>v{versions[x] ?? '…'}</code>
                </span>
              ))}
            </div>
          </div>
          <button type="button" className="btn btn-primary btn-sm" disabled={releasing} onClick={doRelease}>
            {releasing ? `Реліз ${mod}…` : `Релізнити ${mod} зараз`}
          </button>
        </div>
        {err && <div className="note warn">{err}</div>}
        {release && (
          <div className="release-card">
            <div className="grid3" style={{ marginTop: '0.75rem' }}>
              <div className="panel kpi" style={{ margin: 0 }}>
                <b className="mf">
                  v{release.previousVersion} → v{release.nextVersion}
                </b>
                <span>версія {release.name}</span>
              </div>
              <div className="panel kpi" style={{ margin: 0 }}>
                <b className="mf">{(release.buildMs / 1000).toFixed(2)}s</b>
                <span>реальна збірка лише remote</span>
              </div>
              <div className="panel kpi" style={{ margin: 0 }}>
                <b className="mf">0</b>
                <span>перезбірок shell / monolith</span>
              </div>
            </div>
            <div className="table-wrap" style={{ marginTop: '0.75rem', border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>До</th>
                    <th>Після</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>sha256 remoteEntry</td>
                    <td>
                      <code>{release.remoteEntryBefore?.sha256 ?? '—'}</code>
                    </td>
                    <td>
                      <code>{release.remoteEntryAfter?.sha256 ?? '—'}</code>
                    </td>
                  </tr>
                  <tr>
                    <td>розмір</td>
                    <td>{release.remoteEntryBefore ? `${release.remoteEntryBefore.bytes} B` : '—'}</td>
                    <td>{release.remoteEntryAfter ? `${release.remoteEntryAfter.bytes} B` : '—'}</td>
                  </tr>
                  <tr>
                    <td>mtime</td>
                    <td className="muted">{release.remoteEntryBefore?.mtime ?? '—'}</td>
                    <td className="muted">{release.remoteEntryAfter?.mtime ?? '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="muted" style={{ fontSize: 0.85, margin: '0.75rem 0 0' }}>
              {release.note} Перезавантажте MF-вітрину (:5200) у Arena — у футері зʼявиться нова версія {release.name}.
              Моноліт на preview лишається зі старою вшитою версією, доки його не перезібрати повністю.
            </p>
          </div>
        )}
      </div>

      <div className="panel reveal">
        <div className="arena-controls" style={{ marginBottom: 0 }}>
          <b style={{ fontSize: 14 }}>Модель пайплайну · змінений модуль:</b>
          {MODS.map((x) => (
            <div
              key={x}
              className={`toggle ${mod === x ? 'on' : ''}`}
              style={mod === x ? { borderColor: 'var(--mf)', background: 'var(--mf-wash)' } : undefined}
              onClick={() => {
                setMod(x)
                setProg({ mono: 0, mf: 0 })
                setRun(0)
              }}
            >
              {x}
            </div>
          ))}
          <button type="button" className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={start}>
            Запустити симуляцію
          </button>
        </div>
      </div>
      <div className="grid2 reveal" style={{ marginTop: '1.1rem' }}>
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3 className="mono" style={{ margin: 0, fontFamily: 'var(--display)' }}>
              Пайплайн моноліту
            </h3>
            <span className="big-num mono">{prog.mono.toFixed(1)}s</span>
          </div>
          <div className="mods">
            {MODS.map((x) => (
              <span key={x} className="mod hit">
                {x}
              </span>
            ))}
            <span className="muted" style={{ fontSize: 13, alignSelf: 'center' }}>
              радіус впливу: 100%
            </span>
          </div>
          <Pipe stages={monoStages} p={prog.mono} cls="mono" />
        </div>
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h3 className="mf" style={{ margin: 0, fontFamily: 'var(--display)' }}>
              Пайплайн мікрофронтенду
            </h3>
            <span className="big-num mf">{prog.mf.toFixed(1)}s</span>
          </div>
          <div className="mods">
            {MODS.map((x) => (
              <span key={x} className={`mod ${x === mod ? 'hit-mf' : ''}`}>
                {x}
              </span>
            ))}
            <span className="muted" style={{ fontSize: 13, alignSelf: 'center' }}>
              радіус впливу: {Math.round(100 / MODS.length)}%
            </span>
          </div>
          <Pipe stages={mfStages} p={prog.mf} cls="mf" />
        </div>
      </div>
      <div className="grid3 reveal" style={{ marginTop: '1.1rem' }}>
        <div className="panel kpi">
          <b className="mf">{(monoT / mfT).toFixed(1)}×</b>
          <span>швидший lead time для зміни (модель)</span>
        </div>
        <div className="panel kpi">
          <b className="mf">{Math.round(86400 / mfT / 60)}</b>
          <span>теоретичних релізів/день на команду (vs {Math.round(86400 / monoT / 60)} спільних)</span>
        </div>
        <div className="panel kpi">
          <b className="mf">0</b>
          <span>інших команд заблоковано під час релізу</span>
        </div>
      </div>
      <div className="note reveal">
        Симуляція: збірка = виміряна ({sec(b('monolith') * 1000)} моноліт vs {sec(b(mod) * 1000)} {mod}); тести{' '}
        {TEST_PER_MODULE}s/модуль, деплой {DEPLOY}s, координація {COORD}s. Живий реліз вище — не симуляція: змінює{' '}
        <code>version.json</code>, збирає remote і оновлює <code>remoteEntry.js</code>.
      </div>
    </section>
  )
}
