import { useEffect, useState } from 'react'
import { Hero } from './sections/Hero'
import { Research } from './sections/Research'
import { Solution } from './sections/Solution'
import { Theory } from './sections/Theory'
import { Architecture } from './sections/Architecture'
import { Arena } from './sections/Arena'
import { Metrics } from './sections/Metrics'
import { Runtime } from './sections/Runtime'
import { Deploy } from './sections/Deploy'
import { Teams } from './sections/Teams'
import { Tradeoffs } from './sections/Tradeoffs'
import { Software } from './sections/Software'
import { Testing } from './sections/Testing'
import { Report } from './sections/Report'
import { Decide } from './sections/Decide'
import { Takeaways } from './sections/Takeaways'

const LINKS = [
  ['research', 'Дослідження'],
  ['solution', 'Рішення'],
  ['theory', 'Теорія'],
  ['architecture', 'Архітектура'],
  ['arena', 'Арена'],
  ['metrics', 'Метрики'],
  ['runtime', 'Runtime'],
  ['deploy', 'Деплой'],
  ['teams', 'Команди'],
  ['software', 'ПЗ'],
  ['testing', 'Тестування'],
  ['report', 'Звіт'],
  ['decide', 'Вибір'],
  ['takeaways', 'Підсумки'],
]

export default function App() {
  const [active, setActive] = useState('')

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            if (e.target.tagName === 'SECTION' && e.target.id) setActive(e.target.id)
          }
        }),
      { threshold: 0.18 },
    )
    document.querySelectorAll('.reveal, section[id]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <nav className="nav">
        <a href="#top" className="brand">
          СПЛІТ<em>ЛАБ</em>
        </a>
        <div className="nav-links">
          {LINKS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? 'on' : ''}>
              {label}
            </a>
          ))}
        </div>
      </nav>
      <main id="top">
        <Hero />
        <Research />
        <Solution />
        <Theory />
        <Architecture />
        <Arena />
        <Metrics />
        <Runtime />
        <Deploy />
        <Teams />
        <Tradeoffs />
        <Software />
        <Testing />
        <Report />
        <Decide />
        <Takeaways />
      </main>
      <footer className="foot">
        Демо для захисту магістерської роботи · <b>Даніїл Пасенко</b>, ФеІм-12
        <br />
        Мікрофронтендна архітектура вебзастосунків · той самий код функцій · дві стратегії інтеграції · виміряно, а не
        припущено.
      </footer>
    </>
  )
}
