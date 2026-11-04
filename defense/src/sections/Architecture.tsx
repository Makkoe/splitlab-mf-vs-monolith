const Box = ({
  x, y, w, h, label, sub, color,
}: {
  x: number; y: number; w: number; h: number; label: string; sub?: string; color: string
}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={4} fill={color + '18'} stroke={color} strokeWidth={1.5} />
    <text x={x + w / 2} y={y + h / 2 - (sub ? 4 : -4)} textAnchor="middle" fill="#101820" fontSize={13} fontWeight={700}>
      {label}
    </text>
    {sub && (
      <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fill="#5c6b7a" fontSize={10}>
        {sub}
      </text>
    )}
  </g>
)

export function Architecture() {
  const M = '#b45309'
  const F = '#0f766e'
  const V = '#0d9488'
  const P = '#0e7490'
  return (
    <section id="architecture" className="section">
      <div className="reveal">
        <div className="eyebrow">03 · Дизайн експерименту · реалізує рішення</div>
        <h2 className="h2">
          Той самий код, <span className="mf">дві композиції</span>
        </h2>
        <p className="lead">
          Модулі функцій (<code>catalog</code>, <code>checkout</code>, <code>reviews</code>) і UI хоста написані один раз.
          Моноліт імпортує їх статично; shell завантажує їх у рантаймі через Module Federation.
          Стратегія інтеграції — <b>єдина незалежна змінна</b>.
        </p>
      </div>
      <div className="grid2 reveal">
        <div className="panel arch">
          <div className="arch-title">
            <h3 className="mono">Моноліт</h3>
            <span className="tag mono">:5300 · 1 build · 1 deploy</span>
          </div>
          <svg viewBox="0 0 460 330">
            <rect x={20} y={20} width={420} height={240} rx={6} fill="none" stroke={M} strokeDasharray="4 4" />
            <text x={36} y={44} fill={M} fontSize={11} fontFamily="IBM Plex Mono, monospace">
              bundle.js (єдиний артефакт)
            </text>
            <Box x={50} y={60} w={360} h={50} label="Host UI" sub="header · cart · orders" color={M} />
            <Box x={50} y={130} w={110} h={60} label="catalog" sub="React" color={M} />
            <Box x={175} y={130} w={110} h={60} label="checkout" sub="React" color={M} />
            <Box x={300} y={130} w={110} h={60} label="reviews" sub="Vue" color={M} />
            <text x={230} y={225} textAnchor="middle" fill="#5c6b7a" fontSize={11}>
              спільний runtime · спільний релізний поїзд
            </text>
            <Box x={130} y={280} w={200} h={40} label="1 CI/CD pipeline" color={M} />
            <line x1={230} y1={260} x2={230} y2={280} stroke={M} />
          </svg>
        </div>
        <div className="panel arch">
          <div className="arch-title">
            <h3 className="mf">Мікрофронтенди</h3>
            <span className="tag">4 builds · 4 deploys</span>
          </div>
          <svg viewBox="0 0 460 330">
            <Box x={110} y={20} w={240} h={56} label="Shell (host) :5200" sub="routing · cart · boundaries" color={F} />
            {(
              [
                [20, 'catalog :5201', 'React · Discovery', F],
                [170, 'checkout :5202', 'React · Payments', P],
                [320, 'reviews :5203', 'Vue · Community', V],
              ] as const
            ).map(([x, l, s, c]) => (
              <g key={l}>
                <path
                  className="flow"
                  d={`M230 76 C230 120, ${x + 60} 110, ${x + 60} 150`}
                  stroke={c}
                  fill="none"
                  strokeWidth={2}
                />
                <Box x={x} y={150} w={120} h={60} label={l.split(' ')[0]} sub={l.split(' ')[1]} color={c} />
                <text x={x + 60} y={228} textAnchor="middle" fill="#5c6b7a" fontSize={10}>
                  {s}
                </text>
                <rect x={x + 15} y={250} width={90} height={30} rx={4} fill={c + '12'} stroke={c} strokeDasharray="3 3" />
                <text x={x + 60} y={270} textAnchor="middle" fill="#2a3544" fontSize={11}>
                  власний пайплайн
                </text>
              </g>
            ))}
            <text x={230} y={315} textAnchor="middle" fill="#5c6b7a" fontSize={11}>
              remoteEntry.js у рантаймі · React shared як singleton
            </text>
          </svg>
        </div>
      </div>
      <div className="grid2 reveal" style={{ marginTop: '1.1rem' }}>
        <div className="panel">
          <h4 style={{ marginTop: 0, fontFamily: 'var(--code)', fontSize: '0.8rem' }}>monolith/src/main.tsx</h4>
          <pre>{`import * as catalog  from '../../mf/catalog/src/mount'
import * as checkout from '../../mf/checkout/src/mount'
import * as reviews  from '../../mf/reviews/src/mount'
// resolved at BUILD time → one bundle`}</pre>
        </div>
        <div className="panel">
          <h4 style={{ marginTop: 0, fontFamily: 'var(--code)', fontSize: '0.8rem' }}>mf/shell/src/main.tsx</h4>
          <pre>{`catalog:  () => import('catalog/mount'),
checkout: () => import('checkout/mount'),
reviews:  () => import('reviews/mount'),
// resolved at RUNTIME from remoteEntry.js`}</pre>
        </div>
      </div>
    </section>
  )
}
