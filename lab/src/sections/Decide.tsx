import { useState } from 'react'

const QUESTIONS = [
  { id: 'teams', q: 'How many teams work on the front-end?', lo: '1 team', hi: '10+ teams', w: 3 },
  { id: 'domains', q: 'How many distinct business domains?', lo: 'One', hi: 'Many', w: 2 },
  { id: 'release', q: 'Required release frequency', lo: 'Monthly', hi: 'Many per day', w: 2 },
  { id: 'legacy', q: 'Need to migrate a legacy app gradually?', lo: 'No', hi: 'Yes, critical', w: 2 },
  { id: 'tech', q: 'Need for heterogeneous tech stacks', lo: 'None', hi: 'Strong', w: 1 },
  { id: 'perf', q: 'Payload size is the #1 priority', lo: 'No', hi: 'Absolutely', w: -2 },
  { id: 'ops', q: 'DevOps maturity (CI/CD, monitoring)', lo: 'Low', hi: 'High', w: 1.5 },
]

export function Decide() {
  const [v, setV] = useState<Record<string, number>>(Object.fromEntries(QUESTIONS.map((q) => [q.id, 2])))
  const totalW = QUESTIONS.reduce((s, q) => s + Math.abs(q.w), 0)
  const raw = QUESTIONS.reduce((s, q) => s + q.w * (v[q.id] - 2) / 2, 0) // -totalW..totalW
  const score = Math.round(((raw / totalW) + 1) * 50) // 0..100
  const verdict = score > 62 ? ['Micro-frontends', 'grad', 'Your context benefits from independent teams and deployments. Start with a vertical split and Module Federation.']
    : score < 40 ? ['Monolith (modular)', 'grad-mono', 'Keep a well-structured modular monolith. Revisit when teams or domains grow.']
    : ['Modular monolith → MF-ready', 'muted', 'Structure code by domain with clear boundaries now; extract micro-frontends when pain appears.']

  return (
    <section id="decide" className="section">
      <div className="reveal">
        <div className="eyebrow">08 · Decision framework</div>
        <h2 className="h2">Should <span className="grad">you</span> use micro-frontends?</h2>
        <p className="lead">A weighted multi-criteria model derived from the analysis above. Adjust to your project.</p>
      </div>
      <div className="grid2 reveal">
        <div className="card">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="q">
              <div className="q-head">{q.q}<span>{v[q.id]}/4</span></div>
              <input id={`decide-${q.id}`} className="range" type="range" min={0} max={4} value={v[q.id]} onChange={(e) => setV({ ...v, [q.id]: +e.target.value })} />
              <small><span>{q.lo}</span><span>weight {q.w > 0 ? '+' : ''}{q.w}</span><span>{q.hi}</span></small>
            </div>
          ))}
        </div>
        <div className="card" style={{ position: 'sticky', top: 90, alignSelf: 'start' }}>
          <div className="muted" style={{ fontSize: 13 }}>Recommendation score</div>
          <div className="big-num">{score}<span className="muted" style={{ fontSize: 20 }}>/100</span></div>
          <div className="gauge"><div className="gauge-needle" style={{ left: `${score}%` }} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }} className="muted"><span>Monolith</span><span>Hybrid</span><span>Micro-frontends</span></div>
          <div className={`verdict ${verdict[1]}`}>{verdict[0]}</div>
          <p className="muted" style={{ margin: 0 }}>{verdict[2]}</p>
        </div>
      </div>
    </section>
  )
}
