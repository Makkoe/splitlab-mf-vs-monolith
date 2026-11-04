const ROWS: [string, string, string, 'mf' | 'mono' | 'tie'][] = [
  ['Ізоляція збоїв', 'Один дефект може обвалити весь UI', 'Збій стриманий межею модуля', 'mf'],
  ['Деплой', 'Єдиний релізний поїзд, координований', 'Незалежний, багато разів на день', 'mf'],
  ['Час збірки / CI', 'Росте з усім кодом', 'Росте лише зі зміненою одиницею', 'mf'],
  ['Автономія команд', 'Спільна кодова база, merge-конфлікти', 'End-to-end володіння доменом', 'mf'],
  ['Еволюція технологій', 'Big-bang оновлення фреймворків', 'Покроково, по модулях (React + Vue тут)', 'mf'],
  ['Міграція legacy', 'Переписати або зупинитися', 'Strangler-fig: замінювати по частинах', 'mf'],
  ['Кеш після релізу', 'Інвалідується весь бандл', 'Інвалідується лише змінений remote', 'mf'],
  ['Розмір payload', 'Оптимальний tree-shaking, без дублювання', 'Runtime + можливі дублікати залежностей', 'mono'],
  ['Операційна складність', 'Один застосунок для хостингу й моніторингу', 'Багато артефактів, версіонування, контракти', 'mono'],
  ['Узгодженість UX', 'Природна — одна кодова база', 'Потрібна спільна дизайн-система', 'mono'],
  ['Мала команда (1–3 сквади)', 'Просто і швидко', 'Оверхед переважує вигоди', 'mono'],
  ['End-to-end тестування', 'Прямолінійне', 'Потрібні контрактні + інтеграційні тести', 'mono'],
  ['Оптимізація продуктивності', 'Можлива глобальна оптимізація', 'По модулях; узгодження спільних залежностей', 'tie'],
]

export function Tradeoffs() {
  const mf = ROWS.filter((r) => r[3] === 'mf').length
  const mono = ROWS.filter((r) => r[3] === 'mono').length
  return (
    <section id="tradeoffs" className="section">
      <div className="reveal">
        <div className="eyebrow">08 · Критичний аналіз</div>
        <h2 className="h2">
          <span className="mf">Чесна</span> матриця компромісів
        </h2>
        <p className="lead">
          Переконливий захист показує й обмеження. Мікрофронтенди виграють {mf} з {ROWS.length} критеріїв — переважно ті, що
          важливі на масштабі, — тоді як моноліт зберігає {mono} переваг у простоті та payload.
        </p>
      </div>
      <div className="table-wrap reveal">
        <table>
          <thead>
            <tr>
              <th>Критерій</th>
              <th>Моноліт</th>
              <th>Мікрофронтенди</th>
              <th>Перевага</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([c, a, b, w]) => (
              <tr key={c}>
                <td>
                  <b>{c}</b>
                </td>
                <td className="muted">{a}</td>
                <td className="muted">{b}</td>
                <td>
                  {w === 'mf' ? (
                    <span className="tag">Мікрофронтенди</span>
                  ) : w === 'mono' ? (
                    <span className="tag mono">Моноліт</span>
                  ) : (
                    <span className="tag ok">Залежить</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid3 reveal" style={{ marginTop: '1.1rem' }}>
        <div className="panel">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Помʼякшення в цьому демо</h3>
          <ul className="check-list">
            <li>Singleton sharing React між shell і remotes</li>
            <li>Error boundary + retry на кожен remote</li>
            <li>Префіксований CSS і типізовані event-контракти</li>
          </ul>
        </div>
        <div className="panel">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Антипатерни</h3>
          <ul className="check-list x-list">
            <li>Поділ за технічним шаром замість домену</li>
            <li>Спільний глобальний store між MF</li>
            <li>Занадто багато крихітних MF («nano-frontends»)</li>
          </ul>
        </div>
        <div className="panel">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Індустріальне впровадження</h3>
          <ul className="check-list">
            <li>IKEA, Zalando (Project Mosaic)</li>
            <li>Spotify, DAZN, SAP Luigi</li>
            <li>Allegro, PayPal, Upwork</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
