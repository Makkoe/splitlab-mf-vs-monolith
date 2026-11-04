const PRINCIPLES = [
  ['Технологічна незалежність', 'Кожна команда обирає і оновлює свій стек. Тут модуль Vue 3 reviews живе всередині оболонки React 19.'],
  ['Ізольований код команд', 'Немає спільного runtime store. Контракти явні: props вхід, CustomEvents вихід.'],
  ['Іменовані ресурси', 'CSS, події та ключі сховища префіксуються по командах, щоб уникнути колізій.'],
  ['Нативні API браузера', 'Комунікація через CustomEvent — слабке звʼязування без спільної JS-бібліотеки.'],
  ['Стійкість за замовчуванням', 'Кожен remote обгорнутий у error boundary; збої деградують коректно.'],
  ['Незалежна доставка', 'Кожна одиниця має свій пайплайн і може релізитися багато разів на день.'],
]

const APPROACHES: [string, string, number, number, number, number, string][] = [
  ['Пакети на етапі збірки (npm)', 'Compile', 1, 5, 5, 1, 'Просто, але кожен реліз перезбирає host — розподілений моноліт.'],
  ['Server-side includes', 'Server', 4, 4, 3, 3, 'Сильно для контентних сайтів; обмежена клієнтська інтерактивність.'],
  ['iframes', 'Runtime', 5, 1, 2, 5, 'Максимальна ізоляція, слабкі UX / SEO / a11y.'],
  ['Web Components', 'Runtime', 3, 4, 4, 4, 'Стандартизована інкапсуляція; SSR і стилі складніші.'],
  ['single-spa', 'Runtime', 4, 3, 4, 4, 'Зрілий lifecycle-роутер з адаптерами фреймворків.'],
  ['Module Federation ★', 'Runtime', 4, 4, 5, 5, 'Remotes на вимогу + узгодження спільних залежностей — використано тут.'],
]

const HISTORY = [
  ['2011', 'Self-contained systems і SOA на бекенді'],
  ['2014', 'Мікросервіси — бекенди розділені, фронтенди лишаються монолітними'],
  ['2016', '«Micro Frontends» зʼявляється в ThoughtWorks Tech Radar'],
  ['2019', 'Cam Jackson на martinfowler.com; single-spa 4.0'],
  ['2020', 'Webpack 5 випускає Module Federation'],
  ['2024+', 'Vite / Rspack federation; впровадження в IKEA, Spotify, Zalando'],
]

const Dots = ({ n }: { n: number }) => (
  <span className="dots">
    {'●'.repeat(n)}
    <span className="off">{'●'.repeat(5 - n)}</span>
  </span>
)

export function Theory() {
  return (
    <section id="theory" className="section">
      <div className="reveal">
        <div className="eyebrow">02 · Теорія</div>
        <h2 className="h2">
          Що таке <span className="mf">мікрофронтенди</span>?
        </h2>
        <p className="lead">
          Архітектурний стиль, у якому вебзастосунок декомпонується на <b>вертикальні, бізнес-орієнтовані зрізи</b>, кожен з яких
          належить автономній команді end-to-end і складається в один продукт — на етапі збірки, на сервері або в браузері.
        </p>
      </div>

      <div className="reveal" style={{ marginBottom: '2.5rem' }}>
        {PRINCIPLES.map(([t, d]) => (
          <div key={t} className="prin">
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </div>

      <h3 className="reveal" style={{ fontFamily: 'var(--display)', fontSize: '1.35rem', margin: '0 0 1rem' }}>
        Еволюція
      </h3>
      <div className="timeline reveal">
        {HISTORY.map(([y, t]) => (
          <div key={y} className="tl">
            <b>{y}</b>
            <p>{t}</p>
          </div>
        ))}
      </div>

      <h3 className="reveal" style={{ fontFamily: 'var(--display)', fontSize: '1.35rem', margin: '3rem 0 1rem' }}>
        Підходи до інтеграції
      </h3>
      <div className="table-wrap reveal">
        <table>
          <thead>
            <tr>
              <th>Підхід</th>
              <th>Композиція</th>
              <th>Ізоляція</th>
              <th>UX / SEO</th>
              <th>DX</th>
              <th>Незал. деплой</th>
              <th>Висновок</th>
            </tr>
          </thead>
          <tbody>
            {APPROACHES.map(([n, c, iso, ux, dx, dep, v]) => (
              <tr key={n} className={n.includes('★') ? 'hl' : ''}>
                <td>
                  <b>{n}</b>
                </td>
                <td>
                  <span className="tag">{c}</span>
                </td>
                <td>
                  <Dots n={iso} />
                </td>
                <td>
                  <Dots n={ux} />
                </td>
                <td>
                  <Dots n={dx} />
                </td>
                <td>
                  <Dots n={dep} />
                </td>
                <td className="muted" style={{ minWidth: 220 }}>
                  {v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid2 reveal" style={{ marginTop: '1.5rem' }}>
        <div className="panel">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Патерни комунікації</h3>
          <ul className="check-list">
            <li>
              <span>
                <b>Custom events</b> — фреймворк-нейтральний pub/sub через <code>window</code>
              </span>
            </li>
            <li>
              <span>
                <b>Props / attributes</b> — host передає дані в <code>mount(el, props)</code>
              </span>
            </li>
            <li>
              <span>
                <b>URL як стан</b> — параметри маршрутизації як спільний контракт
              </span>
            </li>
            <li>
              <span>
                <b>Спільне сховище</b> — іменовані <code>localStorage</code> / <code>BroadcastChannel</code>
              </span>
            </li>
          </ul>
        </div>
        <div className="panel">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Стратегії декомпозиції</h3>
          <ul className="check-list">
            <li>
              <span>
                <b>Вертикальний поділ</b> — один MF на сторінку/маршрут (Checkout)
              </span>
            </li>
            <li>
              <span>
                <b>Горизонтальний поділ</b> — кілька MF на одній сторінці (Catalog + Reviews)
              </span>
            </li>
            <li>
              <span>
                <b>Domain-driven</b> — межі за DDD-контекстами та топологією команд
              </span>
            </li>
            <li>
              <span>
                <b>Закон Конвея</b> — архітектура віддзеркалює комунікацію організації
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
