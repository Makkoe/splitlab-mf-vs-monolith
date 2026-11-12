import { useEffect, useState } from 'react'
import { labApi } from '../labApi'

type Check = {
  id: string
  title: string
  how: string
  expectMf: string
  expectMono: string
  auto?: () => Promise<'pass' | 'fail' | 'skip'>
}

type Reach = boolean | null

function useUp(url: string) {
  const [ok, setOk] = useState<Reach>(null)
  useEffect(() => {
    let alive = true
    const ping = () =>
      fetch(url, { mode: 'no-cors' })
        .then(() => alive && setOk(true))
        .catch(() => alive && setOk(false))
    ping()
    const t = setInterval(ping, 4000)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [url])
  return ok
}

async function pingOk(url: string) {
  try {
    await fetch(url, { mode: 'no-cors' })
    return true
  } catch {
    return false
  }
}

export function Testing() {
  const [done, setDone] = useState<Record<string, boolean>>({})
  const [auto, setAuto] = useState<Record<string, 'pass' | 'fail' | 'skip' | 'run'>>({})
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const mf = useUp('http://localhost:5200/')
  const mono = useUp('http://localhost:5300/')
  const remotes = [
    useUp('http://localhost:5201/'),
    useUp('http://localhost:5202/'),
    useUp('http://localhost:5203/'),
  ]
  const lab = useUp('http://localhost:5111/api/health')

  const CASES: Check[] = [
    {
      id: 'boot',
      title: 'Обидві вітрини стартують',
      how: 'Авто: ping :5200 і :5300.',
      expectMf: 'Shell завантажує remotes',
      expectMono: 'Один застосунок рендерить усі функції',
      auto: async () => ((await pingOk('http://localhost:5200/')) && (await pingOk('http://localhost:5300/')) ? 'pass' : 'fail'),
    },
    {
      id: 'remotes',
      title: 'Усі remotes UP',
      how: 'Авто: ping :5201–:5203.',
      expectMf: 'catalog/checkout/reviews слухають порти',
      expectMono: 'N/A',
      auto: async () => {
        const ok = await Promise.all([5201, 5202, 5203].map((p) => pingOk(`http://localhost:${p}/`)))
        return ok.every(Boolean) ? 'pass' : 'fail'
      },
    },
    {
      id: 'lab',
      title: 'lab-control доступний',
      how: 'Авто: GET :5111/api/health.',
      expectMf: 'Stop/Start/Release працюють',
      expectMono: '—',
      auto: async () => {
        try {
          await labApi.health()
          return 'pass'
        } catch {
          return 'fail'
        }
      },
    },
    {
      id: 'metrics',
      title: 'Метрики збірки наявні',
      how: 'Авто: /metrics.json не sample.',
      expectMf: 'gzip/build по remote',
      expectMono: 'числа єдиного артефакту',
      auto: async () => {
        const r = await fetch('/metrics.json')
        if (!r.ok) return 'fail'
        const j = await r.json()
        return j.measuredAt && !j.sample ? 'pass' : 'fail'
      },
    },
    {
      id: 'cart',
      title: 'Подія кошика між модулями',
      how: 'Вручну: додати товар з catalog → лічильник у host.',
      expectMf: 'Event bus: catalog → shell',
      expectMono: 'Той самий UX через спільний код host',
    },
    {
      id: 'cross-fw',
      title: 'Комунікація React → Vue',
      how: 'Вручну: клікнути товар; Vue reviews реагує.',
      expectMf: 'CustomEvent доходить до Vue remote',
      expectMono: 'Та сама шина всередині одного бандла',
    },
    {
      id: 'fault',
      title: 'Ізоляція збоїв (Arena)',
      how: 'Вручну: fail catalog/reviews у Arena.',
      expectMf: 'Fallback у слоті; решта магазину працює',
      expectMono: 'Екран крашу всього застосунку',
    },
    {
      id: 'remote-down',
      title: 'Мережева відмова remote',
      how: 'Авто+руч: Stop reviews у Arena, reload MF.',
      expectMf: 'Reviews недоступні; catalog працює',
      expectMono: 'N/A (немає remotes)',
      auto: async () => {
        try {
          const before = await labApi.remotes()
          if (!before.reviews?.up) return 'skip'
          await labApi.stop('reviews')
          const mid = await labApi.remotes()
          const down = !mid.reviews.up
          await labApi.start('reviews')
          return down ? 'pass' : 'fail'
        } catch {
          return 'fail'
        }
      },
    },
    {
      id: 'deploy-live',
      title: 'Незалежний реліз remote',
      how: 'Вручну або з Deploy: Релізнити checkout — нова версія без rebuild shell.',
      expectMf: 'version.json + новий sha remoteEntry',
      expectMono: 'стара вшита версія до повного rebuild',
    },
    {
      id: 'checkout',
      title: 'Happy path checkout',
      how: 'Вручну: товари → Checkout → Orders.',
      expectMf: 'Checkout remote на вимогу',
      expectMono: 'Той самий потік зі статичного імпорту',
    },
  ]

  const passed = Object.values(done).filter(Boolean).length
  const autoPass = Object.values(auto).filter((v) => v === 'pass').length

  const runAuto = async () => {
    setRunning(true)
    setLog([])
    for (const c of CASES) {
      if (!c.auto) continue
      setAuto((a) => ({ ...a, [c.id]: 'run' }))
      setLog((l) => [...l, `→ ${c.id}…`])
      try {
        const res = await c.auto()
        setAuto((a) => ({ ...a, [c.id]: res }))
        if (res === 'pass') setDone((d) => ({ ...d, [c.id]: true }))
        setLog((l) => [...l, `  ${c.id}: ${res}`])
      } catch (e) {
        setAuto((a) => ({ ...a, [c.id]: 'fail' }))
        setLog((l) => [...l, `  ${c.id}: fail (${e})`])
      }
    }
    setRunning(false)
  }

  return (
    <section id="testing" className="section">
      <div className="reveal">
        <div className="eyebrow">08 · Результати тестування · 5 балів</div>
        <h2 className="h2">
          Чекліст <span className="mf">перевірки</span>
        </h2>
        <p className="lead">
          Частина сценаріїв проганяється автоматично (порти, lab-control, metrics, stop/start remote). Решту
          позначте вручну після live-демо в Arena/Deploy.
        </p>
      </div>

      <div className="grid4 reveal" style={{ marginBottom: '1.1rem' }}>
        {[
          ['MF shell', mf, ':5200'],
          ['Catalog remote', remotes[0], ':5201'],
          ['Checkout remote', remotes[1], ':5202'],
          ['Reviews remote', remotes[2], ':5203'],
        ].map(([label, up, port]) => (
          <div key={label as string} className="panel kpi">
            <b className={up === true ? 'mf' : up === false ? 'mono' : 'muted'}>
              {up === null ? '…' : up ? 'UP' : 'DOWN'}
            </b>
            <span>
              {label as string} ({port as string})
            </span>
          </div>
        ))}
      </div>
      <div className="panel reveal" style={{ marginBottom: '1.1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span>
            Моноліт :5300 —{' '}
            <b className={mono === true ? 'mf' : mono === false ? 'mono' : 'muted'}>
              {mono === null ? 'перевірка…' : mono ? 'UP' : 'DOWN'}
            </b>
            {' · '}
            lab-control —{' '}
            <b className={lab === true ? 'mf' : lab === false ? 'mono' : 'muted'}>
              {lab === null ? '…' : lab ? 'UP' : 'DOWN'}
            </b>
          </span>
          <button type="button" className="btn btn-primary btn-sm" disabled={running} onClick={runAuto}>
            {running ? 'Автотест…' : 'Запустити автотести'}
          </button>
          <span className="muted" style={{ fontFamily: 'var(--code)', fontSize: 13 }}>
            ручні ✓ {passed}/{CASES.length} · авто pass {autoPass}
          </span>
        </div>
        {log.length > 0 && (
          <div className="buslog" style={{ marginTop: 10 }}>
            {log.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        )}
      </div>

      <div className="table-wrap reveal">
        <table>
          <thead>
            <tr>
              <th>✓</th>
              <th>Авто</th>
              <th>Тест-кейс</th>
              <th>Процедура</th>
              <th>Очікувано · MF</th>
              <th>Очікувано · Моноліт</th>
            </tr>
          </thead>
          <tbody>
            {CASES.map((c) => (
              <tr key={c.id} className={auto[c.id] === 'pass' ? 'hl' : undefined}>
                <td>
                  <input
                    type="checkbox"
                    checked={!!done[c.id]}
                    onChange={(e) => setDone({ ...done, [c.id]: e.target.checked })}
                    aria-label={c.title}
                  />
                </td>
                <td>
                  {c.auto ? (
                    <span className={`tag ${auto[c.id] === 'pass' ? 'ok' : auto[c.id] === 'fail' ? 'mono' : ''}`}>
                      {auto[c.id] || 'ready'}
                    </span>
                  ) : (
                    <span className="muted">manual</span>
                  )}
                </td>
                <td>
                  <b>{c.title}</b>
                </td>
                <td className="muted">{c.how}</td>
                <td>{c.expectMf}</td>
                <td>{c.expectMono}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="note reveal">
        Автотест remote-down тимчасово зупиняє reviews і одразу піднімає назад. Не запускайте його посеред усного
        демо Arena, якщо показуєте живий stop вручну.
      </div>
    </section>
  )
}
