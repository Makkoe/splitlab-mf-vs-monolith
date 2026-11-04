import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { PRODUCTS, CATEGORIES, formatUAH, type Product } from '../../../shared/products'
import { emit, on } from '../../../shared/bus'
import { injectStyles } from '../../../shared/styles'
import { css } from './styles'

export const meta = { name: 'catalog', team: 'Команда Discovery', framework: 'React 19', version: '2.3.1' }

function Catalog() {
  const [cat, setCat] = useState('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'pop' | 'asc' | 'desc'>('pop')
  const [wish, setWish] = useState<number[]>([])
  const [added, setAdded] = useState<number | null>(null)

  useEffect(() => on<{ query: string }>('search', (e) => setQuery(e.detail.query)), [])

  const list = useMemo(() => {
    let l = PRODUCTS.filter(
      (p) => (cat === 'all' || p.category === cat) &&
        (p.name + p.brand).toLowerCase().includes(query.toLowerCase()),
    )
    if (sort === 'asc') l = [...l].sort((a, b) => a.price - b.price)
    if (sort === 'desc') l = [...l].sort((a, b) => b.price - a.price)
    if (sort === 'pop') l = [...l].sort((a, b) => b.rating - a.rating)
    return l
  }, [cat, query, sort])

  const add = (p: Product) => {
    emit('cart:add', { product: p }, meta.name)
    setAdded(p.id)
    setTimeout(() => setAdded(null), 700)
  }
  const toggleWish = (p: Product) => {
    const wished = !wish.includes(p.id)
    setWish(wished ? [...wish, p.id] : wish.filter((i) => i !== p.id))
    emit('wishlist:change', { productId: p.id, wished }, meta.name)
  }

  return (
    <section className="cat-root">
      <div className="cat-toolbar">
        <div className="cat-chips">
          {CATEGORIES.map((c) => (
            <button key={c.id} id={`cat-chip-${c.id}`} className={`cat-chip ${cat === c.id ? 'on' : ''}`} onClick={() => setCat(c.id)}>
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
        <select id="cat-sort" className="cat-sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
          <option value="pop">За рейтингом</option>
          <option value="asc">Ціна ↑</option>
          <option value="desc">Ціна ↓</option>
        </select>
      </div>
      {query && <p className="cat-hint">Результати для «{query}» — знайдено {list.length}</p>}
      <div className="cat-grid">
        {list.map((p) => (
          <article key={p.id} className="cat-card" onClick={() => emit('product:select', { product: p }, meta.name)}>
            {p.oldPrice && <span className="cat-badge">-{Math.round((1 - p.price / p.oldPrice) * 100)}%</span>}
            <button className={`cat-heart ${wish.includes(p.id) ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); toggleWish(p) }} aria-label="обране">
              {wish.includes(p.id) ? '♥' : '♡'}
            </button>
            <div className="cat-emoji">{p.emoji}</div>
            <div className="cat-brand">{p.brand}</div>
            <h3 className="cat-name">{p.name}</h3>
            <div className="cat-rating">★ {p.rating}</div>
            <div className="cat-bottom">
              <div>
                <div className="cat-price">{formatUAH(p.price)}</div>
                {p.oldPrice && <div className="cat-old">{formatUAH(p.oldPrice)}</div>}
              </div>
              <button id={`cat-add-${p.id}`} className={`cat-add ${added === p.id ? 'done' : ''}`} onClick={(e) => { e.stopPropagation(); add(p) }}>
                {added === p.id ? '✓' : '+ Кошик'}
              </button>
            </div>
          </article>
        ))}
        {list.length === 0 && <div className="cat-empty">Нічого не знайдено 🔍</div>}
      </div>
    </section>
  )
}

export function mount(el: HTMLElement) {
  injectStyles('cat-styles', css)
  const root = createRoot(el)
  root.render(<StrictMode><Catalog /></StrictMode>)
  return () => root.unmount()
}

/** Federation host unwraps ESM Module namespaces to `.default`. */
export default { mount, meta }
