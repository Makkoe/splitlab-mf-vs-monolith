export function Solution() {
  return (
    <section id="solution" className="section">
      <div className="reveal">
        <div className="eyebrow">02 · Запропоноване рішення · 5 балів</div>
        <h2 className="h2">
          Контрольоване порівняння за <span className="mf">задумом</span>
        </h2>
        <p className="lead">
          Код функцій лишається ідентичним. Змінюється лише спосіб інтеграції модулів. Вимірюються результати,
          важливі для надійності, швидкості доставки та автономії команд.
        </p>
      </div>

      <div className="grid3 reveal">
        <div className="panel">
          <span className="tag">Інваріант</span>
          <h3 style={{ fontFamily: 'var(--display)', margin: '0.7rem 0 0.4rem' }}>Спільний код функцій</h3>
          <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            <code>catalog</code>, <code>checkout</code>, <code>reviews</code>, UI хоста, дані продуктів і event bus живуть
            в одному дереві. Обидва застосунки монтують ті самі модулі.
          </p>
        </div>
        <div className="panel">
          <span className="tag mono">Варіант A</span>
          <h3 style={{ fontFamily: 'var(--display)', margin: '0.7rem 0 0.4rem' }} className="mono">
            Моноліт
          </h3>
          <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Статичні імпорти на етапі збірки → один бандл, один релізний поїзд, один домен збою (:5300).
          </p>
        </div>
        <div className="panel">
          <span className="tag">Варіант B</span>
          <h3 style={{ fontFamily: 'var(--display)', margin: '0.7rem 0 0.4rem' }} className="mf">
            Мікрофронтенди
          </h3>
          <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Module Federation у рантаймі → shell + remotes, пайплайни на модуль, error boundaries (:5200–5203).
          </p>
        </div>
      </div>

      <div className="grid2 reveal" style={{ marginTop: '1.1rem' }}>
        <div className="panel">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Стек інтеграції</h3>
          <ul className="check-list">
            <li>Vite + TypeScript + React 19 host</li>
            <li>@originjs/vite-plugin-federation remotes</li>
            <li>Модуль Vue 3 reviews (доказ технезалежності)</li>
            <li>CustomEvent bus з іменованими контрактами</li>
            <li>Error boundaries + graceful fallback UI</li>
          </ul>
        </div>
        <div className="panel">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--display)' }}>Що означає «успіх»</h3>
          <ul className="check-list">
            <li>Збій remote не обнуляє весь магазин</li>
            <li>Виправлення checkout передеплоює лише checkout</li>
            <li>Різниці збірки/payload виміряні, а не заявлені</li>
            <li>Компроміси масштабу команд змодельовані відкрито</li>
            <li>Оцінка рішення допомагає обрати MF vs моноліт</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
