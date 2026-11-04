export interface Product {
  id: number
  name: string
  brand: string
  category: string
  price: number
  oldPrice?: number
  rating: number
  emoji: string
}

export interface CartItem extends Product {
  qty: number
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  customer: { name: string; phone: string; email: string; city: string }
  delivery: string
  payment: string
  createdAt: string
}

export const CATEGORIES = [
  { id: 'all', label: 'Усі', icon: '✨' },
  { id: 'electronics', label: 'Електроніка', icon: '💻' },
  { id: 'audio', label: 'Аудіо', icon: '🎧' },
  { id: 'home', label: 'Дім', icon: '🏠' },
  { id: 'fashion', label: 'Мода', icon: '👟' },
  { id: 'sport', label: 'Спорт', icon: '🚴' },
]

export const PRODUCTS: Product[] = [
  { id: 1, name: 'UltraBook Pro 14', brand: 'Nova', category: 'electronics', price: 54999, oldPrice: 61999, rating: 4.8, emoji: '💻' },
  { id: 2, name: 'Навушники ANC X2', brand: 'Sonic', category: 'audio', price: 5499, oldPrice: 6999, rating: 4.7, emoji: '🎧' },
  { id: 3, name: 'Смартфон Edge 5G', brand: 'Orbit', category: 'electronics', price: 28999, rating: 4.6, emoji: '📱' },
  { id: 4, name: 'Смарт-годинник Pulse', brand: 'Orbit', category: 'electronics', price: 7999, oldPrice: 9499, rating: 4.5, emoji: '⌚' },
  { id: 5, name: 'Портативна колонка Boom', brand: 'Sonic', category: 'audio', price: 2899, rating: 4.4, emoji: '🔊' },
  { id: 6, name: 'Еспресо-машина Barista', brand: 'Casa', category: 'home', price: 12499, oldPrice: 14999, rating: 4.9, emoji: '☕' },
  { id: 7, name: 'Робот-пилосос S9', brand: 'Casa', category: 'home', price: 15999, rating: 4.3, emoji: '🤖' },
  { id: 8, name: 'Кросівки Running Air', brand: 'Stride', category: 'fashion', price: 3999, rating: 4.6, emoji: '👟' },
  { id: 9, name: 'Джинсова куртка Classic', brand: 'Urban', category: 'fashion', price: 2499, oldPrice: 3199, rating: 4.2, emoji: '🧥' },
  { id: 10, name: 'Гірський велосипед Trail', brand: 'Peak', category: 'sport', price: 24999, rating: 4.7, emoji: '🚵' },
  { id: 11, name: 'Килимок Yoga Pro', brand: 'Peak', category: 'sport', price: 899, rating: 4.5, emoji: '🧘' },
  { id: 12, name: 'Бездротові навушники Mini', brand: 'Sonic', category: 'audio', price: 1999, oldPrice: 2599, rating: 4.1, emoji: '🎵' },
]

export const formatUAH = (n: number) => n.toLocaleString('uk-UA') + ' ₴'
