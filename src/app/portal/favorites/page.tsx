import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag } from 'lucide-react'
import { formatCurrency, CARE_LEVELS, SUNLIGHT } from '@/lib/utils'

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions)
  const userId  = (session?.user as any)?.id
  const favorites = await prisma.favorite.findMany({ where: { userId }, include: { plant: true }, orderBy: { createdAt: 'desc' } })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-green-800">Saved Plants</h1>
        <p className="text-gray-500 text-sm mt-1">{favorites.length} plant{favorites.length !== 1 ? 's' : ''} saved</p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 shadow-sm text-center">
          <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold text-gray-400 mb-2">No saved plants yet</h2>
          <p className="text-gray-400 text-sm mb-6">Browse our plant catalog and tap the heart icon to save plants you love.</p>
          <Link href="/plants" className="btn-primary">Browse Plants</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {favorites.map(f => (
            <div key={f.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48">
                <Image src={f.plant.imageUrl} alt={f.plant.nameEn} unoptimized fill className="object-cover" />
                <div className="absolute top-3 right-3 w-8 h-8 bg-terra-500 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white fill-current" />
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-serif font-bold text-green-800">{f.plant.nameEn}</h3>
                  <span className="font-bold text-terra-500">{formatCurrency(f.plant.price)}</span>
                </div>
                <p className="text-gray-400 text-xs italic mb-3">{f.plant.nameEs}</p>
                <div className="flex gap-3 text-xs text-gray-400 mb-4">
                  <span>{CARE_LEVELS[f.plant.careLevel]}</span>
                  <span>{SUNLIGHT[f.plant.sunlight]}</span>
                </div>
                <Link href="/booking" className="btn-secondary w-full text-sm py-2.5 flex items-center justify-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Book Consultation
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
