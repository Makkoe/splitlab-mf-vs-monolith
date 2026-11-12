/**
 * The storefront host. The SAME component is used by:
 *  - mf/shell   → modules loaded at RUNTIME via Module Federation, each wrapped in an isolation boundary
 *  - monolith   → modules imported at BUILD time into one bundle, no isolation
 * Thus the only variable in the experiment is the integration architecture.
 */
import { Component, useEffect, useRef, useState, type ReactNode } from 'react'
import { emit, on, failedModules, type BusEvent } from './bus'
import { formatUAH, type CartItem, type Order, type Product } from './products'
import { injectStyles } from './styles'
import { hostCss } from './hostCss'
import { reportRuntime } from './runtimeProbe'

export type Mode = 'mf' | 'monolith'
type Unmount = (() => void) & { update?: (p: any) => void }
export interface RemoteModule { mount: (el: HTMLElement, props?: any) => Unmount; meta: { name: string; team: string; framework: string; version: string } }
export type Loaders = Record<'catalog' | 'checkout' | 'reviews', () => Promise<RemoteModule>>

/* ---------- Isolation boundary (MF only) ---------- */
class Boundary extends Component<{ name: string; children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error) { emit('module:failed', { module: this.props.name, error: error.message }, 'shell') }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="h-fallback">
        <div className="h-fallback-ico">⚠️</div>
        <b>«{this.props.name}» тимчасово недоступний</b>
        <span>{this.state.error.message}</span>
        <small>Решта магазину працює — збій ізольовано в цьому мікрофронтенді.</small>
        <button onClick={() => this.setState({ error: null })}>Повторити</button>
      </div>
    )
  }
}

/* ---------- Generic slot that mounts any framework ---------- */
function Slot({ name, loader, props, mode, onMeta }: { name: string; loader: () => Promise<RemoteModule>; props?: any; mode: Mode; onMeta: (m: RemoteModule['meta'], ms: number) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const handle = useRef<Unmount | null>(null)
  const [state, setState] = useState<'loading' | 'ready'>('loading')
  const [err, setErr] = useState<Error | null>(null)
  if (err) throw err // → Boundary (MF) or whole app (monolith)

  useEffect(() => {
    let alive = true
    const t0 = performance.now()
    loader()
      .then((raw) => {
        // Module Federation may unwrap ESM namespaces to `.default` (named-only exports → undefined).
        const mod = (raw && typeof (raw as RemoteModule).mount === 'function'
          ? raw
          : (raw as { default?: RemoteModule })?.default) as RemoteModule
        if (!mod || typeof mod.mount !== 'function') throw new Error('Remote module missing mount()')
        if (failedModules().includes(name)) throw new Error(`Injected failure: ${name} crashed during render`)
        if (!alive || !ref.current) return
        handle.current = mod.mount(ref.current, props)
        onMeta(mod.meta, Math.round(performance.now() - t0))
        setState('ready')
      })
      .catch((e: Error) => alive && setErr(e))
    return () => { alive = false; handle.current?.(); handle.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name])

  useEffect(() => { handle.current?.update?.(props) }, [props])

  return (
    <div className={`h-slot ${mode === 'mf' ? 'h-slot-mf' : ''}`} data-module={name}>
      {mode === 'mf' && <span className="h-slot-tag">{name}</span>}
      {state === 'loading' && <div className="h-skeleton"><div /><div /><div /></div>}
      <div ref={ref} />
    </div>
  )
}

/* ---------- Fatal crash screen (monolith) ---------- */
class FatalBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error) { emit('app:crashed', { error: error.message }, 'monolith') }
  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="h-fatal">
        <div className="h-fatal-code">500</div>
        <h1>Увесь застосунок недоступний</h1>
        <pre>Uncaught Error: {this.state.error.message}{'\n'}    at App (bundle.js)</pre>
        <p>У моноліті всі функції ділять один бандл, один реліз і один runtime. Помилка в одній зоні вимикає весь вітрину.</p>
      </div>
    )
  }
}

/* ---------- Host application ---------- */
export function HostApp({ mode, loaders }: { mode: Mode; loaders: Loaders }) {
  useEffect(() => injectStyles('host-styles', hostCss), [])
  const [view, setView] = useState<'shop' | 'checkout' | 'orders'>('shop')
  const [cart, setCart] = useState<CartItem[]>(() => JSON.parse(localStorage.getItem(`${mode}-cart`) ?? '[]'))
  const [orders, setOrders] = useState<Order[]>(() => JSON.parse(localStorage.getItem(`${mode}-orders`) ?? '[]'))
  const [drawer, setDrawer] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [metas, setMetas] = useState<Record<string, RemoteModule['meta'] & { ms: number }>>({})
  const [log, setLog] = useState<BusEvent[]>([])
  const [bump, setBump] = useState(false)

  useEffect(() => localStorage.setItem(`${mode}-cart`, JSON.stringify(cart)), [cart, mode])
  useEffect(() => localStorage.setItem(`${mode}-orders`, JSON.stringify(orders)), [orders, mode])

  useEffect(() => {
    const modules = Object.fromEntries(
      Object.entries(metas).map(([k, m]) => [k, { version: m.version, framework: m.framework, mountMs: m.ms }]),
    )
    reportRuntime(mode, modules)
  }, [mode, metas])

  useEffect(() => {
    const offs = [
      on('*', (e) => setLog((l) => [e, ...l].slice(0, 30))),
      on<{ product: Product }>('cart:add', ({ detail: { product } }) => {
        setCart((c) => {
          const ex = c.find((i) => i.id === product.id)
          return ex ? c.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i)) : [...c, { ...product, qty: 1 }]
        })
        setBump(true); setTimeout(() => setBump(false), 400)
        setToast(`${product.emoji} ${product.name} додано до кошика`)
      }),
      on<Order>('order:complete', ({ detail }) => { setOrders((o) => [detail, ...o]); setCart([]) }),
      on<{ to: 'shop' }>('nav', ({ detail }) => setView(detail.to)),
    ]
    return () => offs.forEach((f) => f())
  }, [])

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 1800); return () => clearTimeout(t) } }, [toast])
  useEffect(() => { const t = setTimeout(() => emit('search', { query: search }, 'shell'), 250); return () => clearTimeout(t) }, [search])

  const count = cart.reduce((s, i) => s + i.qty, 0)
  const total = cart.reduce((s, i) => s + i.qty * i.price, 0)
  const setQty = (id: number, d: number) => setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: i.qty + d } : i)).filter((i) => i.qty > 0))
  const onMeta = (m: RemoteModule['meta'], ms: number) => setMetas((x) => ({ ...x, [m.name]: { ...m, ms } }))

  const wrap = (name: string, node: ReactNode) => (mode === 'mf' ? <Boundary name={name}>{node}</Boundary> : node)
  const slot = (name: keyof Loaders, props?: any) => wrap(name, <Slot name={name} loader={loaders[name]} props={props} mode={mode} onMeta={onMeta} />)

  const app = (
    <div className={`h-app h-${mode}`}>
      <header className="h-header">
        <div className="h-logo" onClick={() => setView('shop')}>
          <span className="h-logo-mark">◆</span> МаркетХаб
          <span className={`h-arch ${mode}`}>{mode === 'mf' ? 'Мікрофронтенди' : 'Моноліт'}</span>
        </div>
        <div className="h-search">
          <span>🔍</span>
          <input id="h-search" placeholder="Пошук товарів, брендів…" value={search} onChange={(e) => { setSearch(e.target.value); setView('shop') }} />
        </div>
        <nav className="h-nav">
          <button id="h-nav-orders" className={view === 'orders' ? 'on' : ''} onClick={() => setView('orders')}>📦 Замовлення{orders.length > 0 && <i>{orders.length}</i>}</button>
          <button id="h-cart" className={`h-cart ${bump ? 'bump' : ''}`} onClick={() => setDrawer(true)}>🛒 {formatUAH(total)}{count > 0 && <i>{count}</i>}</button>
        </nav>
      </header>

      <main className="h-main">
        {view === 'shop' && (
          <div className="h-shop">
            <div className="h-hero">
              <div>
                <h1>Осінній Tech Week</h1>
                <p>До −25% на аудіо та ноутбуки. Зібрано з {mode === 'mf' ? '3 незалежно розгорнутих мікрофронтендів' : 'одного бандла на етапі збірки'}.</p>
              </div>
              <div className="h-hero-emoji">🛍️</div>
            </div>
            <div className="h-grid">
              <div>{slot('catalog')}</div>
              <div>{slot('reviews')}</div>
            </div>
          </div>
        )}
        {view === 'checkout' && slot('checkout', { items: cart })}
        {view === 'orders' && (
          <div className="h-orders">
            <h2>Історія замовлень</h2>
            {orders.length === 0 && <p className="h-muted">Замовлень ще немає.</p>}
            {orders.map((o) => (
              <div key={o.id} className="h-order">
                <div><b>{o.id}</b><span className="h-muted"> · {new Date(o.createdAt).toLocaleString('uk-UA')}</span></div>
                <div className="h-order-items">{o.items.map((i) => <span key={i.id}>{i.emoji}×{i.qty}</span>)}</div>
                <b>{formatUAH(o.total)}</b>
                <button onClick={() => { setCart(o.items); setView('checkout') }}>🔁 Повторити</button>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="h-footer">
        <div className="h-footer-title">{mode === 'mf' ? 'Композиція в runtime' : 'Композиція на етапі збірки'}</div>
        {(['catalog', 'reviews', 'checkout'] as const).map((n) => {
          const m = metas[n]
          return (
            <div key={n} className="h-mod">
              <span className={`h-dot ${m ? 'ok' : ''}`} />
              <b>{n}</b>
              {m ? <span>{m.framework} · v{m.version} · {m.team} · {m.ms} ms</span> : <span className="h-muted">не завантажено</span>}
            </div>
          )
        })}
        <details className="h-bus">
          <summary>📡 Шина подій · {log.length}</summary>
          <div>{log.map((e, i) => <code key={i}><b>{e.source}</b> → {e.type}</code>)}</div>
        </details>
      </footer>

      <div className={`h-overlay ${drawer ? 'on' : ''}`} onClick={() => setDrawer(false)} />
      <aside className={`h-drawer ${drawer ? 'on' : ''}`}>
        <div className="h-drawer-head"><h3>Ваш кошик</h3><button onClick={() => setDrawer(false)}>✕</button></div>
        {cart.length === 0 && <p className="h-muted">Кошик порожній</p>}
        {cart.map((i) => (
          <div key={i.id} className="h-line">
            <span className="h-line-emoji">{i.emoji}</span>
            <div className="h-line-info"><b>{i.name}</b><span>{formatUAH(i.price)}</span></div>
            <div className="h-qty"><button onClick={() => setQty(i.id, -1)}>−</button>{i.qty}<button onClick={() => setQty(i.id, 1)}>+</button></div>
          </div>
        ))}
        <div className="h-drawer-total"><span>Разом</span><b>{formatUAH(total)}</b></div>
        <button id="h-checkout" className="h-primary" disabled={!cart.length} onClick={() => { setDrawer(false); setView('checkout') }}>Оформити →</button>
      </aside>

      {toast && <div className="h-toast">{toast}</div>}
    </div>
  )

  return mode === 'monolith' ? <FatalBoundary>{app}</FatalBoundary> : app
}
