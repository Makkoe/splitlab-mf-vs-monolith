import { useEffect, useState } from 'react'
import { Hero } from './sections/Hero'
import { Theory } from './sections/Theory'
import { Architecture } from './sections/Architecture'
import { Arena } from './sections/Arena'
import { Metrics } from './sections/Metrics'
import { Deploy } from './sections/Deploy'
import { Teams } from './sections/Teams'
import { Tradeoffs } from './sections/Tradeoffs'
import { Decide } from './sections/Decide'

const LINKS = [
  ['theory', 'Theory'], ['architecture', 'Architecture'], ['arena', 'Live Arena'], ['metrics', 'Metrics'],
  ['deploy', 'Deploy'], ['teams', 'Team Scaling'], ['tradeoffs', 'Trade-offs'], ['decide', 'Decide'],
]

export default function App() {
  const [active, setActive] = useState('')

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in')
        if (e.target.tagName === 'SECTION' && e.target.id) setActive(e.target.id)
      }
    }), { threshold: 0.15 })
    document.querySelectorAll('.reveal, section[id]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <div className="bg-orbs"><i /><i /><i /></div>
      <div className="grid-bg" />
      <nav className="nav">
        <a href="#top" className="nav-logo">◆ <span>MF Lab</span></a>
        <div className="nav-links">
          {LINKS.map(([id, label]) => <a key={id} id={`nav-${id}`} href={`#${id}`} className={active === id ? 'on' : ''}>{label}</a>)}
        </div>
      </nav>
      <main id="top">
        <Hero />
        <Theory />
        <Architecture />
        <Arena />
        <Metrics />
        <Deploy />
        <Teams />
        <Tradeoffs />
        <Decide />
      </main>
      <footer className="foot">
        Master's thesis research platform · <b>Daniil Pasenko</b>, FeIm-12 · “Micro-frontend architecture of web applications”<br />
        Same feature code · two integration strategies · measured, not assumed.
      </footer>
    </>
  )
}
