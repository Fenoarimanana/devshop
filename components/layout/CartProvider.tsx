'use client'
import { createContext, useContext, useEffect, useReducer } from 'react'
import { CartItem, CartState } from '@/types'

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; state: CartState }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.id === action.item.id)
      if (existing) return state // digital products: no duplicates
      const items = [...state.items, action.item]
      return { items, total: items.reduce((sum, i) => sum + i.price * i.quantity, 0) }
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter((i) => i.id !== action.id)
      return { items, total: items.reduce((sum, i) => sum + i.price * i.quantity, 0) }
    }
    case 'CLEAR':
      return { items: [], total: 0 }
    case 'HYDRATE':
      return action.state
    default:
      return state
  }
}

type CartContextType = CartState & {
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
  hasItem: (id: string) => boolean
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 })

  useEffect(() => {
    try {
      const saved = localStorage.getItem('devshop-cart')
      if (saved) dispatch({ type: 'HYDRATE', state: JSON.parse(saved) })
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('devshop-cart', JSON.stringify(state))
  }, [state])

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem: (item) => dispatch({ type: 'ADD_ITEM', item }),
        removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', id }),
        clearCart: () => dispatch({ type: 'CLEAR' }),
        hasItem: (id) => state.items.some((i) => i.id === id),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
