'use client'
import Link from 'next/link'
import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { formatCurrency } from '@/lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-cream">
        <div className="max-w-2xl mx-auto px-4 text-center py-20">
          <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold text-green-800 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Looks like you haven't added any plants yet.</p>
          <Link href="/plants" className="btn-primary">Browse Plants</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16 min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-bold text-green-800 mb-8">Your Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items */}
          <div className="flex-1 space-y-4">
            {items.map(item => (
              <div key={item.plantId} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 items-start">
                <img
                  src={item.imageUrl}
                  alt={item.plantName}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-green-800 truncate">{item.plantName}</h3>
                  <p className="text-xs text-gray-400 italic mb-2">{item.plantNameEs}</p>
                  <p className="text-sm font-bold text-terra-500">{formatCurrency(item.onlinePrice ?? item.price)}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => removeItem(item.plantId)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.plantId, item.qty - 1)}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-700 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.plantId, item.qty + 1)}
                      disabled={item.qty >= item.onlineStock}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-green-500 hover:text-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    {formatCurrency((item.onlinePrice ?? item.price) * item.qty)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h2 className="font-serif text-xl font-bold text-green-800 mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-800 text-base">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </div>
              <Link href="/shop/checkout" className="btn-primary w-full text-center block py-3">
                Proceed to Checkout
              </Link>
              <Link href="/plants" className="block text-center text-sm text-green-700 hover:text-green-800 mt-3 font-medium">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
