/**
 * Reviews micro-frontend — written in **Vue 3** (render functions, no SFC compiler needed)
 * to demonstrate technology-agnostic composition: it lives inside a React shell and talks
 * to the React catalog purely through the DOM event bus.
 */
import { createApp, defineComponent, h, onMounted, onUnmounted, ref, computed } from 'vue'
import { on, emit } from '../../../shared/bus'
import { injectStyles } from '../../../shared/styles'
import type { Product } from '../../../shared/products'
import { css } from './styles'
import versionInfo from '../version.json'

export const meta = { name: 'reviews', team: 'Команда Community', framework: 'Vue 3', version: versionInfo.version }

interface Review { id: number; productId: number; author: string; stars: number; text: string }

const SEED: Review[] = [
  { id: 1, productId: 2, author: 'Олена', stars: 5, text: 'Шумозаглушення на рівні за цю ціну.' },
  { id: 2, productId: 1, author: 'Макс', stars: 5, text: 'Збирає Vite-проєкти за секунди. Супер.' },
  { id: 3, productId: 6, author: 'Ірина', stars: 4, text: 'Чудове еспресо, трохи гучно вранці.' },
  { id: 4, productId: 3, author: 'Тарас', stars: 4, text: 'Батареї вистачає на два дні.' },
  { id: 5, productId: 2, author: 'Андрій', stars: 4, text: 'Комфортні для довгих дзвінків.' },
]

const Reviews = defineComponent({
  setup() {
    const product = ref<Product | null>(null)
    const reviews = ref<Review[]>([...SEED])
    const text = ref('')
    const stars = ref(5)
    let off: () => void = () => {}

    onMounted(() => { off = on<{ product: Product }>('product:select', (e) => { product.value = e.detail.product }) })
    onUnmounted(() => off())

    const visible = computed(() =>
      product.value ? reviews.value.filter((r) => r.productId === product.value!.id) : reviews.value.slice(-4).reverse())
    const avg = computed(() =>
      visible.value.length ? (visible.value.reduce((s, r) => s + r.stars, 0) / visible.value.length).toFixed(1) : '—')

    const submit = () => {
      if (!product.value || !text.value.trim()) return
      const r = { id: Date.now(), productId: product.value.id, author: 'Ви', stars: stars.value, text: text.value.trim() }
      reviews.value = [...reviews.value, r]
      emit('review:add', { productId: r.productId, stars: r.stars }, meta.name)
      text.value = ''
    }

    return () => h('aside', { class: 'rv-root' }, [
      h('div', { class: 'rv-head' }, [
        h('span', { class: 'rv-vue' }, 'Vue 3'),
        h('h3', product.value ? `${product.value.emoji} ${product.value.name}` : 'Останні відгуки'),
        h('div', { class: 'rv-avg' }, [h('b', avg.value), h('span', ' ★ сер.')]),
      ]),
      !product.value && h('p', { class: 'rv-tip' }, 'Натисніть картку товару — React-каталог повідомить цей Vue-модуль через шину подій.'),
      h('div', { class: 'rv-list' }, visible.value.length
        ? visible.value.map((r) => h('div', { class: 'rv-item', key: r.id }, [
            h('div', { class: 'rv-meta' }, [h('b', r.author), h('span', { class: 'rv-stars' }, '★'.repeat(r.stars) + '☆'.repeat(5 - r.stars))]),
            h('p', r.text),
          ]))
        : [h('p', { class: 'rv-tip' }, 'Відгуків ще немає — будьте першим!')]),
      product.value && h('div', { class: 'rv-form' }, [
        h('div', { class: 'rv-pick' }, [1, 2, 3, 4, 5].map((n) =>
          h('button', { class: ['rv-star', n <= stars.value && 'on'], onClick: () => (stars.value = n) }, '★'))),
        h('textarea', { id: 'rv-text', value: text.value, placeholder: 'Поділіться враженнями…', rows: 2,
          onInput: (e: Event) => (text.value = (e.target as HTMLTextAreaElement).value) }),
        h('button', { id: 'rv-submit', class: 'rv-btn', onClick: submit }, 'Надіслати відгук'),
      ]),
    ])
  },
})

export function mount(el: HTMLElement) {
  injectStyles('rv-styles', css)
  const app = createApp(Reviews)
  app.mount(el)
  return () => app.unmount()
}

/** Federation host unwraps ESM Module namespaces to `.default`. */
export default { mount, meta }
