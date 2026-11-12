const MODULES = [
  { name: 'mf/shell', port: ':5200', role: 'Хост-контейнер, маршрутизація, кошик, межі', stack: 'React 19' },
  { name: 'mf/catalog', port: ':5201', role: 'Remote каталогу / discovery', stack: 'React 19' },
  { name: 'mf/checkout', port: ':5202', role: 'Remote checkout і оплати', stack: 'React 19' },
  { name: 'mf/reviews', port: ':5203', role: 'Remote reviews (крос-фреймворк)', stack: 'Vue 3' },
  { name: 'monolith', port: ':5300', role: 'Ті самі функції, один бандл', stack: 'React + Vue' },
  { name: 'shared/', port: '—', role: 'HostApp, bus, products, styles', stack: 'TS' },
  { name: 'defense/', port: ':5100', role: 'UI демо СПЛІТЛАБ для захисту', stack: 'React' },
  { name: 'scripts/measure.mjs', port: 'CLI', role: 'Збірник метрик збірки і gzip + історія', stack: 'Node' },
  { name: 'scripts/lab-control.mjs', port: ':5111', role: 'Stop/Start remotes, live release, report API', stack: 'Node' },
]

export function Software() {
  return (
    <section id="software" className="section">
      <div className="reveal">
        <div className="eyebrow">07 · Розробка ПЗ · 5 балів</div>
        <h2 className="h2">
          Що було <span className="mf">реалізовано</span>
        </h2>
        <p className="lead">
          Запускабельна дослідницька платформа: дві вітрини промислового вигляду плюс інтерактивна лабораторія захисту,
          яка керує експериментами над ними.
        </p>
      </div>

      <div className="table-wrap reveal">
        <table>
          <thead>
            <tr>
              <th>Модуль</th>
              <th>Порт</th>
              <th>Відповідальність</th>
              <th>Стек</th>
            </tr>
          </thead>
          <tbody>
            {MODULES.map((m) => (
              <tr key={m.name}>
                <td>
                  <code>{m.name}</code>
                </td>
                <td>
                  <span className="tag">{m.port}</span>
                </td>
                <td className="muted">{m.role}</td>
                <td>{m.stack}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid2 reveal" style={{ marginTop: '1.1rem' }}>
        <div className="panel">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Інженерні практики</h3>
          <ul className="check-list">
            <li>npm workspaces monorepo</li>
            <li>Єдиний HostApp, спільний для MF і моноліту</li>
            <li>Контракти рантайму через типізовані CustomEvents</li>
            <li>Префіксована інʼєкція CSS на remote</li>
            <li>CORS-увімкнені preview-сервери remotes</li>
          </ul>
        </div>
        <div className="panel">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Як запустити</h3>
          <pre>{`cd mf-vs-monolith
npm install
npm start
# demo      http://localhost:5100
# MF        http://localhost:5200
# monolith  http://localhost:5300
npm run measure
# lab-api  http://localhost:5111`}</pre>
        </div>
      </div>
    </section>
  )
}
