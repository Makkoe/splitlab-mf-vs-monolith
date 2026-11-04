import { slides, meta } from './slides-data.mjs'

const deck = document.getElementById('deck')
const counter = document.getElementById('counter')
const prevBtn = document.getElementById('prev')
const nextBtn = document.getElementById('next')

function renderSlide(s) {
  const el = document.createElement('article')
  el.className = 'slide' + (s.kind === 'title' ? ' title-slide' : '')
  el.dataset.id = s.id

  if (s.kind === 'title') {
    const brand = document.createElement('p')
    brand.className = 'brand'
    brand.innerHTML = 'СПЛІТ<span>ЛАБ</span>'
    el.appendChild(brand)
    const h1 = document.createElement('h1')
    h1.textContent = s.title
    el.appendChild(h1)
    for (const line of s.lines || []) {
      const p = document.createElement('p')
      p.className = 'subline'
      p.textContent = line
      el.appendChild(p)
    }
    return el
  }

  if (s.eyebrow) {
    const eye = document.createElement('p')
    eye.className = 'eyebrow'
    eye.textContent = s.eyebrow
    el.appendChild(eye)
  }
  const h1 = document.createElement('h1')
  h1.textContent = s.title
  el.appendChild(h1)

  for (const para of s.paragraphs || []) {
    const p = document.createElement('p')
    p.className = 'para'
    p.textContent = para
    el.appendChild(p)
  }
  if (s.bullets?.length) {
    const ul = document.createElement('ul')
    for (const b of s.bullets) {
      const li = document.createElement('li')
      li.textContent = b
      ul.appendChild(li)
    }
    el.appendChild(ul)
  }
  return el
}

const nodes = slides.map(renderSlide)
nodes.forEach((n) => deck.appendChild(n))

let i = 0
function show(n) {
  i = Math.max(0, Math.min(nodes.length - 1, n))
  nodes.forEach((node, idx) => node.classList.toggle('on', idx === i))
  counter.textContent = `${i + 1} / ${nodes.length}`
  history.replaceState(null, '', `#${slides[i].id}`)
  document.title = `${slides[i].title} · ${meta.product}`
}

function next() { show(i + 1) }
function prev() { show(i - 1) }

prevBtn.addEventListener('click', prev)
nextBtn.addEventListener('click', next)

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
    e.preventDefault()
    next()
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault()
    prev()
  } else if (e.key === 'Home') show(0)
  else if (e.key === 'End') show(nodes.length - 1)
  else if (e.key === 'Escape') toc.classList.toggle('on')
  else if (e.key === 'f' || e.key === 'F') {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.()
    else document.exitFullscreen?.()
  }
})

const toc = document.createElement('div')
toc.className = 'toc-overlay'
toc.innerHTML = `<div class="toc-panel"><h2>Зміст слайдів</h2></div>`
const panel = toc.querySelector('.toc-panel')
slides.forEach((s, idx) => {
  const b = document.createElement('button')
  b.type = 'button'
  b.textContent = `${idx + 1}. ${s.eyebrow ? s.eyebrow + ' — ' : ''}${s.title}`
  b.addEventListener('click', () => {
    toc.classList.remove('on')
    show(idx)
  })
  panel.appendChild(b)
})
toc.addEventListener('click', (e) => {
  if (e.target === toc) toc.classList.remove('on')
})
document.body.appendChild(toc)

const hash = location.hash.replace('#', '')
const start = Math.max(0, slides.findIndex((s) => s.id === hash))
show(start === -1 ? 0 : start)
