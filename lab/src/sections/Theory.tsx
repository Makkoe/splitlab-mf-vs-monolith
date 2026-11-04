const PRINCIPLES = [
  ['🧩', 'Technology agnostic', 'Each team picks and upgrades its stack independently. Here a Vue 3 module lives inside a React 19 shell.'],
  ['🛡️', 'Isolated team code', 'No shared runtime state or globals. Contracts are explicit: props in, DOM events out.'],
  ['🏷️', 'Namespaced resources', 'CSS classes, events and storage keys are prefixed per team (cat-, co-, rv-) to avoid collisions.'],
  ['📡', 'Native browser APIs', 'Communication via CustomEvent instead of a shared JS store — loose coupling by design.'],
  ['💥', 'Resilient by default', 'Every remote is wrapped in an error boundary; a failing module degrades gracefully, never the page.'],
  ['🚀', 'Independent delivery', 'Each unit has its own repository/pipeline and can be released many times a day without coordination.'],
]

const APPROACHES: [string, string, number, number, number, number, string][] = [
  ['Build-time packages (npm)', 'Compile', 1, 5, 5, 1, 'Simple, but every release requires rebuilding the host — effectively a distributed monolith.'],
  ['Server-side includes (SSI/ESI)', 'Server', 4, 4, 3, 3, 'Great for content sites; limited interactivity between fragments.'],
  ['iframes', 'Runtime', 5, 1, 2, 5, 'Maximum isolation, but poor UX, SEO and accessibility; heavy communication.'],
  ['Web Components', 'Runtime', 3, 4, 4, 4, 'Standards-based encapsulation (Shadow DOM); SSR and styling are trickier.'],
  ['single-spa', 'Runtime', 4, 3, 4, 4, 'Mature lifecycle router (bootstrap/mount/unmount), framework adapters.'],
  ['Module Federation ★', 'Runtime', 4, 4, 5, 5, 'Remotes loaded on demand with shared dependency negotiation — used in this study.'],
]

const HISTORY = [
  ['2011', 'Self-contained systems & SOA reach the backend'],
  ['2014', 'Microservices (Lewis & Fowler) — backends split, frontends stay monolithic'],
  ['2016', '“Micro Frontends” enters ThoughtWorks Tech Radar'],
  ['2019', 'Cam Jackson’s article on martinfowler.com; single-spa 4.0'],
  ['2020', 'Webpack 5 ships Module Federation'],
  ['2024+', 'Vite/Rspack federation, Module Federation 2.0, adoption at IKEA, Spotify, Zalando, DAZN'],
]

const Dots = ({ n }: { n: number }) => <span className="dots">{'●'.repeat(n)}<span className="off">{'●'.repeat(5 - n)}</span></span>

export function Theory() {
  return (
    <section id="theory" className="section">
      <div className="reveal">
        <div className="eyebrow">01 · Theory</div>
        <h2 className="h2">What are <span className="grad">micro-frontends</span>?</h2>
        <p className="lead">
          An architectural style where a web application is decomposed into <b>vertical, business-aligned slices</b>, each owned
          end-to-end by an autonomous team and <b>composed into a single product</b> — at build time, on the server, or in the browser.
          It extends the microservice idea beyond the backend.
        </p>
      </div>

      <div className="grid3 reveal">
        {PRINCIPLES.map(([ico, t, d]) => (
          <div key={t} className="card principle"><div className="ico">{ico}</div><h3>{t}</h3><p>{d}</p></div>
        ))}
      </div>

      <h3 className="reveal" style={{ marginTop: 70, fontSize: 24 }}>Evolution</h3>
      <div className="timeline reveal">
        {HISTORY.map(([y, t]) => <div key={y} className="tl"><b>{y}</b><p>{t}</p></div>)}
      </div>

      <h3 className="reveal" style={{ marginTop: 70, fontSize: 24 }}>Integration approaches compared</h3>
      <div className="table-wrap reveal">
        <table>
          <thead><tr><th>Approach</th><th>Composition</th><th>Isolation</th><th>UX / SEO</th><th>DX</th><th>Independent deploy</th><th>Verdict</th></tr></thead>
          <tbody>
            {APPROACHES.map(([n, c, iso, ux, dx, dep, v]) => (
              <tr key={n} className={n.includes('★') ? 'hl' : ''}>
                <td><b>{n}</b></td><td><span className="tag">{c}</span></td>
                <td><Dots n={iso} /></td><td><Dots n={ux} /></td><td><Dots n={dx} /></td><td><Dots n={dep} /></td>
                <td className="muted" style={{ minWidth: 260 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid2 reveal" style={{ marginTop: 40 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Communication patterns</h3>
          <ul className="check-list">
            <li><span><b>Custom events</b> (used here) — framework-neutral pub/sub over <code>window</code></span></li>
            <li><span><b>Props / attributes</b> — host passes data down on mount (<code>mount(el, props)</code>)</span></li>
            <li><span><b>URL as state</b> — routing parameters as the shared contract</span></li>
            <li><span><b>Shared storage</b> — <code>localStorage</code>/<code>BroadcastChannel</code> with namespaced keys</span></li>
          </ul>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Decomposition strategies</h3>
          <ul className="check-list">
            <li><span><b>Vertical split</b> — one MF per page/route (Checkout page)</span></li>
            <li><span><b>Horizontal split</b> — several MFs on one page (Catalog + Reviews)</span></li>
            <li><span><b>Domain-driven</b> — boundaries follow DDD bounded contexts & team topology</span></li>
            <li><span><b>Conway’s law</b> — architecture mirrors the communication structure of the org</span></li>
          </ul>
        </div>
      </div>
    </section>
  )
}
