const MAP = [
  ['Актуальність (5)', '#research', 'Розрив між мікросервісним бекендом і монолітним фронтендом.'],
  ['Обʼєкт (5)', '#object', 'Архітектура великомасштабних складених вебзастосунків.'],
  ['Предмет (5)', '#subject', 'MF vs моноліт для одного маркетплейсу, виміряно порівняльно.'],
  ['Задача (5)', '#problem', 'Контрольований експеримент зі сталим кодом функцій.'],
  ['Рішення (5)', '#solution', 'Подвійна архітектура + Module Federation + спільний HostApp.'],
  ['Результати досліджень (10)', '#arena', 'Arena, Metrics, Deploy, Teams — живі докази.'],
  ['ПЗ (5)', '#software', 'Модулі workspace, remotes, лабораторія, скрипт measure.'],
  ['Тестування (5)', '#testing', 'Старт, кошик, крос-фреймворк, збій, деплой, чекліст метрик.'],
]

export function Takeaways() {
  return (
    <section id="takeaways" className="section">
      <div className="reveal">
        <div className="eyebrow">10 · Карта захисту</div>
        <h2 className="h2">
          Критерії → <span className="mf">розділи демо</span>
        </h2>
        <p className="lead">Користуйтеся цією таблицею під час презентації. Текст звіту може пізніше йти тією ж структурою.</p>
      </div>

      <div className="table-wrap reveal">
        <table>
          <thead>
            <tr>
              <th>Критерій</th>
              <th>Перехід</th>
              <th>Що показати</th>
            </tr>
          </thead>
          <tbody>
            {MAP.map(([c, href, what]) => (
              <tr key={c}>
                <td>
                  <b>{c}</b>
                </td>
                <td>
                  <a href={href}>{href}</a>
                </td>
                <td className="muted">{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel reveal" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Рекомендований live-прохід</h3>
        <ol className="claim-list" style={{ marginTop: '0.75rem' }}>
          <li>
            <b>01</b>
            <span>
              Сформулювати обʼєкт / предмет / задачу з <a href="#research">Дослідження</a>.
            </span>
          </li>
          <li>
            <b>02</b>
            <span>
              Показати діаграми архітектури, потім відкрити MF vs моноліт в <a href="#arena">Arena</a> і зламати модуль.
            </span>
          </li>
          <li>
            <b>03</b>
            <span>
              Пройти <a href="#metrics">Metrics</a> + <a href="#deploy">Deploy</a> + <a href="#teams">Teams</a> як результати
              досліджень.
            </span>
          </li>
          <li>
            <b>04</b>
            <span>
              Вказати на <a href="#software">ПЗ</a> і відмітити кейси <a href="#testing">Тестування</a>.
            </span>
          </li>
          <li>
            <b>05</b>
            <span>
              Закрити компромісами та оцінкою <a href="#decide">Вибір</a>.
            </span>
          </li>
        </ol>
      </div>
    </section>
  )
}
