export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: 'hamburgueres' | 'combos' | 'acompanhamentos' | 'bebidas'
  active: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Customer {
  name: string
  phone: string
  address: string
  neighborhood: string
}

export type PaymentMethod = 'pix' | 'cartao' | 'dinheiro' | 'link'

export type OrderStatus = 'novo' | 'preparando' | 'pronto' | 'entregue'

export interface Order {
  id: string
  number: number
  customer: Customer
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
  paymentMethod: PaymentMethod
  status: OrderStatus
  observation?: string
  createdAt: Date
  updatedAt: Date
}

export type StatusMode = 'automatic' | 'force_open' | 'force_closed'

export interface Settings {
  phone: string
  whatsapp: string
  deliveryFee: number
  openingHours: string
  workingDays: string[]
  statusMode: StatusMode
}

export type UserRole = 'admin' | 'entregador'

export interface User {
  id: string
  username: string
  role: UserRole
}
