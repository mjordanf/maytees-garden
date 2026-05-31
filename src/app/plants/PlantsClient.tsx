'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Heart, Search } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { CARE_LEVELS, SUNLIGHT, WATER, formatCurrency, cn } from '@/lib/utils'
import { useCart } from '@/lib/cart-context'

type Plant = {
  id: string; nameEn: string; nameEs: string
  descriptionEn: string; price: number; imageUrl: string
  category: string; inStock: boolean; featured: boolean
  tags: string; careLevel: string; sunlight: string; water: string
  onlineStock: number; onlinePrice: number | null
}

const CATEGORIES = ['all','tropical','flowering','palms','native','edible','succulents']

export default function PlantsClient({ plants }: { plants: Plant[] }) {
  const { data: session, status } = useSession()
  const { addItem } = useCart()
  const [category, setCategory] = useState('all')
  const [search, setSearch]     = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selected, setSelected]   = useState<Plant | null>(null)
  const [addedIds, setAddedIds]   = useState<Set<string>>(new Set())

  // Load existing favorites from DB when user is authenticated
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/favorites')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.favorites) {
          setFavorites(new Set(data.favorites.map((f: any) => f.plantId)))
        }
      })
      .catch(() => {})
  }, [status])

  const filtered = plants.filter(p => {
    const matchCat = category === 'all' || p.category === category
    const matchSearch = p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
                        p.nameEs.toLowerCase().includes(search.toLowerCase()) ||
                        p.tags.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleAddToCart = (plant: Plant, e: React.MouseEvent) => {
    e.stopPropagation()
    addItem({
      plantId: plant.id,
      plantName: plant.nameEn,
      plantNameEs: plant.nameEs,
      imageUrl: plant.imageUrl,
      price: plant.price,
      onlinePrice: plant.onlinePrice,
      onlineStock: plant.onlineStock,
    })
    setAddedIds(prev => {
      const next = new Set(prev)
      next.add(plant.id)
      return next
    })
    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev)
        next.delete(plant.id)
        return next
      })
    }, 1500)
  }

  const toggleFavorite = async (plantId: string) => {
    // Wait until session is resolved before acting
    if (status === 'loading') return
    if (status === 'unauthenticated') { window.location.href = '/auth/login'; return }
    const next = new Set(favorites)
    if (next.has(plantId)) {
      next.delete(plantId)
      await fetch('/api/favorites', { method: 'DELETE', body: JSON.stringify({ plantId }), headers: { 'Content-Type': 'application/json' } })
    } else {
      next.add(plantId)
      await fetch('/api/favorites', { method: 'POST', body: JSON.stringify({ plantId }), headers: { 'Content-Type': 'application/json' } })
    }
    setFavorites(next)
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-10" placeholder="Search plants..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all capitalize',
                category === c
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-green-400',
              )}
            >
              {c === 'all' ? 'All Plants' : c === 'native' ? 'Native FL' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map(plant => (
          <div key={plant.id} id={plant.id} className="card plant-card-hover group cursor-pointer" onClick={() => setSelected(plant)}>
            <div className="relative h-52 overflow-hidden">
              <Image src={plant.imageUrl} alt={plant.nameEn} unoptimized fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3">
                <span className={cn('badge', plant.inStock ? 'bg-white/90 text-green-700' : 'bg-white/90 text-red-500')}>
                  {plant.inStock ? '● In Stock' : '○ Out of Stock'}
                </span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); toggleFavorite(plant.id) }}
                className={cn('absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all',
                  favorites.has(plant.id) ? 'bg-terra-500 text-white' : 'bg-white/90 text-gray-400 hover:text-terra-500')}
              >
                <Heart className={cn('w-4 h-4', favorites.has(plant.id) && 'fill-current')} />
              </button>
              {plant.featured && (
                <div className="absolute bottom-3 left-3">
                  <span className="badge bg-green-600 text-white">★ Featured</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-serif font-bold text-green-800 leading-tight">{plant.nameEn}</h3>
                <span className="font-bold text-terra-500 shrink-0 ml-2">{formatCurrency(plant.onlinePrice ?? plant.price)}</span>
              </div>
              <p className="text-xs text-gray-400 italic mb-2">{plant.nameEs}</p>
              <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 mb-3">{plant.descriptionEn}</p>
              <div className="flex gap-3 text-xs text-gray-400 border-t border-gray-100 pt-2 mb-3">
                <span title="Care Level">{CARE_LEVELS[plant.careLevel]}</span>
                <span title="Sunlight">{SUNLIGHT[plant.sunlight]}</span>
              </div>
              <div className="flex items-center justify-between">
                {plant.onlineStock === 0 ? (
                  <span className="badge bg-red-100 text-red-500 text-xs">Out of Stock</span>
                ) : (
                  <div className="flex items-center gap-2 flex-1">
                    {plant.onlineStock <= 5 && (
                      <span className="text-xs text-amber-600 font-medium">Only {plant.onlineStock} left!</span>
                    )}
                    <button
                      onClick={e => handleAddToCart(plant, e)}
                      className="ml-auto bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      {addedIds.has(plant.id) ? 'Added!' : 'Add to Cart'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🌿</p>
          <p className="font-serif text-xl">No plants found for "{search}"</p>
          <p className="text-sm mt-2">Try a different search or category</p>
        </div>
      )}

      {/* Plant Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="relative h-72">
              <Image src={selected.imageUrl} alt={selected.nameEn} unoptimized fill className="object-cover" />
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-9 h-9 bg-black/40 text-white rounded-full flex items-center justify-center font-bold hover:bg-black/60">×</button>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-green-800">{selected.nameEn}</h2>
                  <p className="text-gray-400 italic text-sm">{selected.nameEs}</p>
                </div>
                <span className="font-bold text-terra-500 text-2xl">{formatCurrency(selected.price)}</span>
              </div>

              <div className="flex gap-2 my-4 flex-wrap">
                <span className="badge-green capitalize">{selected.category}</span>
                {selected.tags.split(',').map(tag => tag && <span key={tag} className="badge bg-gray-100 text-gray-600">{tag.trim()}</span>)}
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">{selected.descriptionEn}</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Care Level', value: CARE_LEVELS[selected.careLevel] },
                  { label: 'Sunlight', value: SUNLIGHT[selected.sunlight] },
                  { label: 'Water', value: WATER[selected.water] },
                ].map(s => (
                  <div key={s.label} className="text-center bg-green-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">{s.label}</p>
                    <p className="text-sm font-semibold text-green-800">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Stock info in modal */}
              <div className="mb-4">
                {selected.onlineStock === 0 ? (
                  <span className="badge bg-red-100 text-red-500">Out of Stock</span>
                ) : selected.onlineStock <= 5 ? (
                  <span className="text-sm text-amber-600 font-medium">Only {selected.onlineStock} left in stock!</span>
                ) : (
                  <span className="badge bg-green-100 text-green-700">{selected.onlineStock} in stock</span>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => toggleFavorite(selected.id)}
                  className={cn('flex-1 py-3 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all border-2',
                    favorites.has(selected.id) ? 'bg-terra-500 text-white border-terra-500' : 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white')}>
                  <Heart className={cn('w-4 h-4', favorites.has(selected.id) && 'fill-current')} />
                  {favorites.has(selected.id) ? 'Saved' : 'Save Plant'}
                </button>
                {selected.onlineStock > 0 && (
                  <button
                    onClick={e => { handleAddToCart(selected, e); }}
                    className="flex-1 bg-green-600 text-white text-sm py-3 rounded-full font-semibold hover:bg-green-700 transition-colors"
                  >
                    {addedIds.has(selected.id) ? 'Added!' : 'Add to Cart'}
                  </button>
                )}
                <a href="/booking" className="flex-1 btn-primary text-sm py-3 text-center">
                  Book a Consultation
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
