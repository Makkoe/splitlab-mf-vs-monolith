import { useEffect, useState } from 'react'

type Check = { id: string; title: string; how: string; expectMf: string; expectMono: string }

const CASES: Check[] = [
  {
    id: 'boot',
    title: 'Обидві вітрини стартують',
    how: 'Відкрити :5200 і :5300 — видимі catalog, reviews, cart.',
    expectMf: 'Shell завантажує remotes; модулі позначені',
    expectMono: 'Один застосунок рендерить усі функції',
  },
  {
    id: 'cart',
    title: 'Подія кошика між модулями',
    how: 'Додати товар з catalog → лічильник кошика оновлюється в host.',
    expectMf: 'Event bus: catalog → shell',
    expectMono: 'Той самий UX через спільний код host',
  },
  {
    id: 'cross-fw',
    title: 'Комунікація React → Vue',
    how: 'Клікнути товар; панель Vue reviews реагує.',
    expectMf: 'CustomEvent доходить до Vue remote',
    expectMono: 'Та сама шина всередині одного бандла',
  },
  {
    id: 'fault',
    title: 'Ізоляція збоїв (Arena)',
    how: 'Ввести збій у catalog/reviews.',
    expectMf: 'Fallback у слоті; решта магазину працює',
    expectMono: 'Екран крашу всього застосунку',
  },
  {
    id: 'remote-down',
    title: 'Мережева відмова remote',
    how: 'Зупинити preview reviews (:5203) і перезавантажити MF.',
    expectMf: 'Reviews недоступні; catalog працює',
    expectMono: 'N/A (немає remotes)',
  },
  {
    id: 'deploy-sim',
    title: 'Симуляція незалежного деплою',
    how: 'Розділ Deploy → змінити checkout → Запустити пайплайни.',
    expectMf: 'Виконуються лише етапи checkout',
    expectMono: 'Повна координація/тест/збірка/деплой',
  },
  {
    id: 'metrics',
    title: 'Відтворюваність метрик збірки',
    how: 'npm run measure → розділ Metrics оновлюється.',
    expectMf: 'Збірка і gzip-розміри по remote',
    expectMono: 'Числа єдиного артефакту',
  },
  {
    id: 'checkout',
    title: 'Happy path checkout',
    how: 'Додати товари → Checkout → оформити → Orders.',
    expectMf: 'Checkout remote монтується на вимогу',
    expectMono: 'Той самий потік зі статичного імпорту',
  },
]

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

export function Testing() {
  const [done, setDone] = useState<Record<string, boolean>>({})
  const mf = useUp('http://localhost:5200/')
  const mono = useUp('http://localhost:5300/')
  const remotes = [
    useUp('http://localhost:5201/'),
    useUp('http://localhost:5202/'),
    useUp('http://localhost:5203/'),
  ]
  const passed = Object.values(done).filter(Boolean).length

  return (
    <section id="testing" className="section">
      <div className="reveal">
        <div className="eyebrow">08 · Результати тестування · 5 балів</div>
        <h2 className="h2">
          Чекліст <span className="mf">перевірки</span>
        </h2>
        <p className="lead">
          Функціональні та порівняльні сценарії для валідації дослідницької платформи. Позначайте пункти під час
          проходження в день захисту.
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
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span>
            Моноліт :5300 —{' '}
            <b className={mono === true ? 'mf' : mono === false ? 'mono' : 'muted'}>
              {mono === null ? 'перевірка…' : mono ? 'UP' : 'DOWN'}
            </b>
          </span>
          <span className="muted" style={{ fontFamily: 'var(--code)', fontSize: 13 }}>
            Прогрес чекліста: {passed}/{CASES.length}
          </span>
        </div>
      </div>

      <div className="table-wrap reveal">
        <table>
          <thead>
            <tr>
              <th>✓</th>
              <th>Тест-кейс</th>
              <th>Процедура</th>
              <th>Очікувано · MF</th>
              <th>Очікувано · Моноліт</th>
            </tr>
          </thead>
          <tbody>
            {CASES.map((c) => (
              <tr key={c.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={!!done[c.id]}
                    onChange={(e) => setDone({ ...done, [c.id]: e.target.checked })}
                    aria-label={c.title}
                  />
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
        Результати досліджень (10 балів) демонструються наживо в <b>Arena</b>, <b>Metrics</b>, <b>Deploy</b> і <b>Teams</b>.
        Цей чекліст документує протокол тестування, що підкріплює ці спостереження.
      </div>
    </section>
  )
}
