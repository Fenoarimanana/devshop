import { Product, Category, Order, OrderItem, User, ProductType, OrderStatus, DownloadToken } from '@prisma/client'

export type { Product, Category, Order, OrderItem, User, ProductType, OrderStatus, DownloadToken }

export type ProductWithCategory = Product & {
  category: Category | null
}

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product
  })[]
  user: User
}

export type CartItem = {
  id: string
  name: string
  nameEn: string
  price: number
  imageUrl: string | null
  slug: string
  quantity: number
  type: ProductType
}

export type CartState = {
  items: CartItem[]
  total: number
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      role: string
    }
  }
  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    id: string
  }
}
