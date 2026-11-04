export function Claim() {
  return (
    <section id="claim" className="section">
      <div className="reveal claim">
        <div>
          <div className="eyebrow">01 · Твердження роботи</div>
          <h2 className="h2">
            Навіщо <span className="mf">ділити</span> фронтенд?
          </h2>
          <p className="lead">
            Бекенд-команди вже роки тому перейшли на мікросервіси. Фронтенди часто лишалися одним деплоєвим
            модулем — вузьким місцем для автономії, швидкості релізів і стійкості.
            Це демо показує, коли і як мікрофронтенди це виправляють.
          </p>
        </div>
        <ol className="claim-list">
          <li>
            <b>01</b>
            <span>
              <strong>Незалежна доставка</strong> — випустити виправлення checkout без перезбірки catalog.
            </span>
          </li>
          <li>
            <b>02</b>
            <span>
              <strong>Ізоляція збоїв</strong> — зламаний модуль не повинен вимикати весь магазин.
            </span>
          </li>
          <li>
            <b>03</b>
            <span>
              <strong>Масштаб команд</strong> — володіння йде за бізнес-доменами, а не за спільним релізним поїздом.
            </span>
          </li>
          <li>
            <b>04</b>
            <span>
              <strong>Еволюція технологій</strong> — React і Vue співіснують; оновлення — по зрізах.
            </span>
          </li>
        </ol>
      </div>
    </section>
  )
}
