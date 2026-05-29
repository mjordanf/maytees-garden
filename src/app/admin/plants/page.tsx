import { prisma } from '@/lib/prisma'
import AdminPlantsClient from './AdminPlantsClient'

export default async function AdminPlantsPage() {
  const plants = await prisma.plant.findMany({ orderBy: { featured: 'desc' } })
  return <AdminPlantsClient initialPlants={plants} />
}
