const Box = ({ x, y, w, h, label, sub, color }: { x: number; y: number; w: number; h: number; label: string; sub?: string; color: string }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={12} fill={color + '22'} stroke={color} strokeWidth={1.5} />
    <text x={x + w / 2} y={y + h / 2 - (sub ? 4 : -4)} textAnchor="middle" fill="#fff" fontSize={14} fontWeight={700}>{label}</text>
    {sub && <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fill="#8b93a7" fontSize={11}>{sub}</text>}
  </g>
)

export function Architecture() {
  const M = '#f59e0b', F = '#7c83ff', V = '#34d399', P = '#ec4899'
  return (
    <section id="architecture" className="section">
      <div className="reveal">
        <div className="eyebrow">02 · Architecture of the experiment</div>
        <h2 className="h2">Same code, <span className="grad">two compositions</span></h2>
        <p className="lead">
          The feature modules (<code>catalog</code>, <code>checkout</code>, <code>reviews</code>) and the host UI are written once.
          The monolith imports them statically; the micro-frontend shell fetches them over the network at runtime.
          The <b>integration strategy is the only independent variable</b>.
        </p>
      </div>
      <div className="grid2 reveal">
        <div className="card arch">
          <div className="arch-title"><h3 className="grad-mono">Monolith</h3><span className="tag mono">:5300 · 1 build · 1 deploy</span></div>
          <svg viewBox="0 0 460 330">
            <rect x={20} y={20} width={420} height={240} rx={18} fill="none" stroke={M} strokeDasharray="4 4" />
            <text x={36} y={44} fill={M} fontSize={12} fontFamily="monospace">bundle.js (single artifact)</text>
            <Box x={50} y={60} w={360} h={50} label="Host UI" sub="header · cart · orders" color={M} />
            <Box x={50} y={130} w={110} h={60} label="catalog" sub="React" color={M} />
            <Box x={175} y={130} w={110} h={60} label="checkout" sub="React" color={M} />
            <Box x={300} y={130} w={110} h={60} label="reviews" sub="Vue" color={M} />
            <text x={230} y={225} textAnchor="middle" fill="#8b93a7" fontSize={12}>shared runtime · shared release train</text>
            <Box x={130} y={280} w={200} h={40} label="1 CI/CD pipeline" color={M} />
            <line x1={230} y1={260} x2={230} y2={280} stroke={M} />
          </svg>
        </div>
        <div className="card arch">
          <div className="arch-title"><h3 className="grad">Micro-frontends</h3><span className="tag">4 builds · 4 deploys</span></div>
          <svg viewBox="0 0 460 330">
            <Box x={110} y={20} w={240} h={56} label="Shell (host) :5200" sub="routing · cart · error boundaries" color={F} />
            {[[20, 'catalog :5201', 'React · Team Discovery', F], [170, 'checkout :5202', 'React · Team Payments', P], [320, 'reviews :5203', 'Vue · Team Community', V]].map(([x, l, s, c]) => (
              <g key={l as string}>
                <path className="flow" d={`M230 76 C230 120, ${(x as number) + 60} 110, ${(x as number) + 60} 150`} stroke={c as string} fill="none" strokeWidth={2} />
                <Box x={x as number} y={150} w={120} h={60} label={(l as string).split(' ')[0]} sub={(l as string).split(' ')[1]} color={c as string} />
                <text x={(x as number) + 60} y={228} textAnchor="middle" fill="#8b93a7" fontSize={10}>{s as string}</text>
                <rect x={(x as number) + 15} y={250} width={90} height={30} rx={8} fill={(c as string) + '15'} stroke={c as string} strokeDasharray="3 3" />
                <text x={(x as number) + 60} y={270} textAnchor="middle" fill="#cbd5e1" fontSize={11}>own pipeline</text>
              </g>
            ))}
            <text x={230} y={315} textAnchor="middle" fill="#8b93a7" fontSize={12}>remoteEntry.js fetched at runtime · react shared as singleton</text>
          </svg>
        </div>
      </div>
      <div className="grid2 reveal" style={{ marginTop: 20 }}>
        <div className="card"><h4 style={{ marginTop: 0 }}>monolith/src/main.tsx</h4>
          <pre style={{ margin: 0, fontSize: 12, overflow: 'auto' }}><code>{`import * as catalog  from '../../mf/catalog/src/mount'
import * as checkout from '../../mf/checkout/src/mount'
import * as reviews  from '../../mf/reviews/src/mount'
// resolved at BUILD time → one bundle`}</code></pre></div>
        <div className="card"><h4 style={{ marginTop: 0 }}>mf/shell/src/main.tsx</h4>
          <pre style={{ margin: 0, fontSize: 12, overflow: 'auto' }}><code>{`catalog:  () => import('catalog/mount'),
checkout: () => import('checkout/mount'),
reviews:  () => import('reviews/mount'),
// resolved at RUNTIME from remoteEntry.js`}</code></pre></div>
      </div>
    </section>
  )
}
