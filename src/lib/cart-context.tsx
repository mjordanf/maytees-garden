'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type CartItem = {
  plantId: string; plantName: string; plantNameEs: string
  imageUrl: string; price: number; onlinePrice: number | null
  qty: number; onlineStock: number
}

type CartCtx = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'qty'>) => void
  removeItem: (plantId: string) => void
  updateQty: (plantId: string, qty: number) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartCtx>({
  items: [], addItem: () => {}, removeItem: () => {},
  updateQty: () => {}, clearCart: () => {}, totalItems: 0, subtotal: 0,
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('maytees-cart')
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  const persist = (next: CartItem[]) => {
    setItems(next)
    localStorage.setItem('maytees-cart', JSON.stringify(next))
  }

  const addItem = (item: Omit<CartItem, 'qty'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.plantId === item.plantId)
      const next = existing
        ? prev.map(i => i.plantId === item.plantId
            ? { ...i, qty: Math.min(i.qty + 1, item.onlineStock) }
            : i)
        : [...prev, { ...item, qty: 1 }]
      localStorage.setItem('maytees-cart', JSON.stringify(next))
      return next
    })
  }

  const removeItem = (plantId: string) => persist(items.filter(i => i.plantId !== plantId))

  const updateQty = (plantId: string, qty: number) => {
    if (qty < 1) { removeItem(plantId); return }
    persist(items.map(i => i.plantId === plantId ? { ...i, qty: Math.min(qty, i.onlineStock) } : i))
  }

  const clearCart = () => persist([])

  const totalItems = items.reduce((s, i) => s + i.qty, 0)
  const subtotal   = items.reduce((s, i) => s + (i.onlinePrice ?? i.price) * i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
