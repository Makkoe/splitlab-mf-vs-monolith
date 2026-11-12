export function Hero() {
  return (
    <header className="hero">
      <div className="hero-plane" aria-hidden />
      <div className="hero-inner">
        <p className="hero-brand">
          СПЛІТ<span>ЛАБ</span>
        </p>
        <h1>Емпіричне порівняння мікрофронтендів і моноліту</h1>
        <p className="sub">
          Демо для захисту магістерської роботи: один маркетплейс, ідентичні модулі функцій, дві архітектури —
          з живою ізоляцією збоїв, виміряними збірками та чеклістом тестування.
        </p>
        <div className="hero-cta">
          <a href="#arena" className="btn btn-primary">
            Відкрити Живу арену
          </a>
          <a href="#research" className="btn">
            Рамки дослідження
          </a>
        </div>
        <p className="hero-meta">Живі експерименти · незалежний реліз · runtime-метрики · lab-control · ФеІм-12</p>
      </div>
    </header>
  )
}
