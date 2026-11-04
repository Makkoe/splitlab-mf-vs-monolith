export function Hero() {
  return (
    <header className="hero">
      <div className="hero-badge">🎓 Master's thesis · <b>empirical comparison</b> of front-end architectures</div>
      <h1>
        <span className="grad">Micro-frontends</span><span className="vs">vs</span><br />
        <span className="grad-mono">the Monolith</span>
      </h1>
      <p>
        One marketplace. The <b>same feature code</b>. Two integration strategies — build-time bundling and runtime
        Module Federation. Break modules live, measure real builds, simulate deployments and team growth, then decide with data.
      </p>
      <div className="hero-cta">
        <a href="#arena" id="hero-cta-arena" className="btn btn-primary">⚡ Open the Live Arena</a>
        <a href="#theory" id="hero-cta-theory" className="btn">Read the theory →</a>
      </div>
      <div className="hero-stats">
        <div className="stat"><b className="grad">4</b><span>independently deployable units</span></div>
        <div className="stat"><b className="grad">2</b><span>frameworks in one page (React + Vue)</span></div>
        <div className="stat"><b className="grad">100%</b><span>shared feature code between both versions</span></div>
        <div className="stat"><b className="grad">7</b><span>experiments & models</span></div>
      </div>
    </header>
  )
}
