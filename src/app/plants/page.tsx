import { Metadata } from 'next'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { CARE_LEVELS, SUNLIGHT, WATER, formatCurrency } from '@/lib/utils'
import PlantsClient from './PlantsClient'

export const metadata: Metadata = {
  title: 'Plant Catalog',
  description: 'Browse our curated selection of tropical, native, and ornamental plants — hand-selected for Miami and South Florida\'s unique climate.',
}

export default async function PlantsPage() {
  const plants = await prisma.plant.findMany({ orderBy: { featured: 'desc' } })

  return (
    <div className="pt-20 pb-16 min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center py-14">
          <h1 className="section-title text-4xl md:text-5xl">Plant Catalog</h1>
          <p className="section-subtitle mt-3">
            {plants.length} plants curated for Miami's tropical climate — from statement palms to flowering borders
          </p>
        </div>

        <PlantsClient plants={plants} />
      </div>
    </div>
  )
}
