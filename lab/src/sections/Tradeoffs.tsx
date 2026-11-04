const ROWS: [string, string, string, 'mf' | 'mono' | 'tie'][] = [
  ['Fault isolation', 'One defect can crash the whole UI', 'Failure contained by module boundary', 'mf'],
  ['Deployment', 'Single release train, coordinated', 'Independent, many times per day', 'mf'],
  ['Build / CI time', 'Grows with total codebase', 'Grows with the changed unit only', 'mf'],
  ['Team autonomy', 'Shared codebase, merge conflicts', 'End-to-end ownership per domain', 'mf'],
  ['Technology evolution', 'Big-bang framework upgrades', 'Incremental, per module (React + Vue here)', 'mf'],
  ['Legacy migration', 'Rewrite or stall', 'Strangler-fig: replace piece by piece', 'mf'],
  ['Caching after release', 'Whole bundle invalidated', 'Only the changed remote invalidated', 'mf'],
  ['Payload size', 'Optimal tree-shaking, no duplication', 'Runtime + possible duplicate deps', 'mono'],
  ['Operational complexity', 'One app to host and monitor', 'Many artifacts, versioning, contracts', 'mono'],
  ['UX consistency', 'Natural — one codebase', 'Requires shared design system', 'mono'],
  ['Small team (1–3 squads)', 'Simple and fast', 'Overhead outweighs benefits', 'mono'],
  ['End-to-end testing', 'Straightforward', 'Needs contract + integration tests', 'mono'],
  ['Performance tuning', 'Global optimisation possible', 'Per module; shared deps negotiation', 'tie'],
]

export function Tradeoffs() {
  const mf = ROWS.filter((r) => r[3] === 'mf').length
  const mono = ROWS.filter((r) => r[3] === 'mono').length
  return (
    <section id="tradeoffs" className="section">
      <div className="reveal">
        <div className="eyebrow">07 · Critical analysis</div>
        <h2 className="h2">An <span className="grad">honest</span> trade-off matrix</h2>
        <p className="lead">A credible thesis shows limitations too. Micro-frontends win {mf} of {ROWS.length} criteria — mostly those that matter at scale — while the monolith keeps {mono} advantages in simplicity and payload.</p>
      </div>
      <div className="table-wrap reveal">
        <table>
          <thead><tr><th>Criterion</th><th>Monolith</th><th>Micro-frontends</th><th>Advantage</th></tr></thead>
          <tbody>
            {ROWS.map(([c, a, b, w]) => (
              <tr key={c}>
                <td><b>{c}</b></td><td className="muted">{a}</td><td className="muted">{b}</td>
                <td>{w === 'mf' ? <span className="tag">Micro-frontends</span> : w === 'mono' ? <span className="tag mono">Monolith</span> : <span className="tag ok">Depends</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid3 reveal" style={{ marginTop: 20 }}>
        <div className="card"><h3 style={{ marginTop: 0 }}>🧱 Mitigations used here</h3><ul className="check-list">
          <li>Singleton sharing of React between shell and remotes</li><li>Error boundary + retry per remote</li><li>Prefixed CSS & typed event contracts</li></ul></div>
        <div className="card"><h3 style={{ marginTop: 0 }}>⚠️ Anti-patterns</h3><ul className="check-list x-list">
          <li>Splitting by technical layer instead of domain</li><li>Shared global store across MFs</li><li>Too many tiny MFs (“nano-frontends”)</li></ul></div>
        <div className="card"><h3 style={{ marginTop: 0 }}>🏢 Industry adoption</h3><ul className="check-list">
          <li>IKEA, Zalando (Project Mosaic)</li><li>Spotify, DAZN, SAP Luigi</li><li>Allegro, PayPal, Upwork</li></ul></div>
      </div>
    </section>
  )
}
