import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const services = await prisma.service.findMany({
    where: { active: true },
    select: { id: true, nameEn: true, price: true, priceNote: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ services })
}
