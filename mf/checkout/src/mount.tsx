import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { formatUAH, type CartItem } from '../../../shared/products'
import { emit } from '../../../shared/bus'
import { injectStyles } from '../../../shared/styles'
import { css } from './styles'
import versionInfo from '../version.json'

export const meta = { name: 'checkout', team: 'Команда Payments', framework: 'React 19', version: versionInfo.version }

interface Props { items: CartItem[] }

const DELIVERY = [
  { id: 'nova', label: 'Нова Пошта', price: 80, eta: '1–2 дні' },
  { id: 'ukr', label: 'Укрпошта', price: 45, eta: '3–5 днів' },
  { id: 'courier', label: 'Курʼєр', price: 150, eta: 'Сьогодні' },
]
const PAYMENT = [
  { id: 'card', label: '💳 Картка онлайн' },
  { id: 'cod', label: '💵 Накладений платіж' },
  { id: 'apple', label: 'Apple / Google Pay' },
]

function Checkout({ items }: Props) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '' })
  const [delivery, setDelivery] = useState('nova')
  const [payment, setPayment] = useState('card')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mf-profile')
      if (saved) setForm(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const ship = DELIVERY.find((d) => d.id === delivery)!.price
  const total = subtotal + ship

  const validate = () => {
    const e: Record<string, string> = {}
    if (form.name.trim().length < 2) e.name = 'Вкажіть повне імʼя'
    if (!/^\+?\d{10,13}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Некоректний телефон'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Некоректний email'
    if (!form.city.trim()) e.city = 'Місто обовʼязкове'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = () => {
    setProcessing(true)
    setTimeout(() => {
      const id = 'ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase()
      localStorage.setItem('mf-profile', JSON.stringify(form))
      emit('order:complete', { id, items, total, customer: form, delivery, payment, createdAt: new Date().toISOString() }, meta.name)
      setProcessing(false)
      setDone(id)
    }, 900)
  }

  if (done) return (
    <div className="co-root co-success">
      <div className="co-check">✓</div>
      <h2>Замовлення {done} підтверджено</h2>
      <p>Модуль Checkout надіслав <code>order:complete</code>; Shell очистив кошик і зберіг замовлення.</p>
      <button className="co-btn" onClick={() => emit('nav', { to: 'shop' }, meta.name)}>Продовжити покупки</button>
    </div>
  )

  if (items.length === 0) return (
    <div className="co-root co-success">
      <div className="co-check" style={{ background: '#334155' }}>🛒</div>
      <h2>Кошик порожній</h2>
      <button className="co-btn" onClick={() => emit('nav', { to: 'shop' }, meta.name)}>До каталогу</button>
    </div>
  )

  const field = (k: keyof typeof form, label: string, ph: string) => (
    <label className="co-field">
      <span>{label}</span>
      <input id={`co-${k}`} value={form[k]} placeholder={ph} className={errors[k] ? 'err' : ''}
        onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
      {errors[k] && <small>{errors[k]}</small>}
    </label>
  )

  return (
    <div className="co-root">
      <div className="co-steps">
        {['Контакти', 'Доставка', 'Оплата'].map((s, i) => (
          <div key={s} className={`co-step ${step > i ? 'on' : ''}`}><b>{i + 1}</b>{s}</div>
        ))}
      </div>
      <div className="co-layout">
        <div className="co-panel">
          {step === 1 && (<>
            <h3>Контактні дані</h3>
            {field('name', 'ПІБ', 'Даніїл Пасенко')}
            {field('phone', 'Телефон', '+380501234567')}
            {field('email', 'Email', 'you@example.com')}
            {field('city', 'Місто', 'Харків')}
            <button id="co-next-1" className="co-btn" onClick={() => validate() && setStep(2)}>Далі →</button>
          </>)}
          {step === 2 && (<>
            <h3>Спосіб доставки</h3>
            {DELIVERY.map((d) => (
              <label key={d.id} className={`co-opt ${delivery === d.id ? 'on' : ''}`}>
                <input type="radio" checked={delivery === d.id} onChange={() => setDelivery(d.id)} />
                <span className="co-opt-l">{d.label}<small>{d.eta}</small></span>
                <b>{formatUAH(d.price)}</b>
              </label>
            ))}
            <div className="co-row"><button className="co-btn ghost" onClick={() => setStep(1)}>← Назад</button><button id="co-next-2" className="co-btn" onClick={() => setStep(3)}>Далі →</button></div>
          </>)}
          {step === 3 && (<>
            <h3>Оплата</h3>
            {PAYMENT.map((p) => (
              <label key={p.id} className={`co-opt ${payment === p.id ? 'on' : ''}`}>
                <input type="radio" checked={payment === p.id} onChange={() => setPayment(p.id)} />
                <span className="co-opt-l">{p.label}</span>
              </label>
            ))}
            <div className="co-row"><button className="co-btn ghost" onClick={() => setStep(2)}>← Назад</button>
              <button id="co-submit" className="co-btn pay" disabled={processing} onClick={submit}>{processing ? 'Обробка…' : `Сплатити ${formatUAH(total)}`}</button></div>
          </>)}
        </div>
        <aside className="co-summary">
          <h3>Підсумок замовлення</h3>
          {items.map((i) => (
            <div key={i.id} className="co-line"><span>{i.emoji} {i.name} × {i.qty}</span><b>{formatUAH(i.price * i.qty)}</b></div>
          ))}
          <div className="co-line muted"><span>Доставка</span><span>{formatUAH(ship)}</span></div>
          <div className="co-total"><span>Разом</span><b>{formatUAH(total)}</b></div>
        </aside>
      </div>
    </div>
  )
}

export function mount(el: HTMLElement, props: Props) {
  injectStyles('co-styles', css)
  const root = createRoot(el)
  const render = (p: Props) => root.render(<StrictMode><Checkout {...p} /></StrictMode>)
  render(props)
  return Object.assign(() => root.unmount(), { update: render })
}

/** Federation host unwraps ESM Module namespaces to `.default`. */
export default { mount, meta }
