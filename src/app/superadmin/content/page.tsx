export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function ContentHistoryPage() {
  const session = await getServerSession(authOptions)
  if ((session?.user as any)?.role !== 'superadmin') redirect('/auth/login')

  const blocks = await prisma.contentBlock.findMany({
    orderBy: [{ page: 'asc' }, { key: 'asc' }],
    include: { versions: { orderBy: { savedAt: 'desc' }, take: 1 } },
  })

  const byPage = blocks.reduce<Record<string, typeof blocks>>((acc, b) => {
    if (!acc[b.page]) acc[b.page] = []
    acc[b.page].push(b)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Content History</h1>
          <p className="text-gray-400 text-sm mt-1">All editable content blocks and their edit history</p>
        </div>
      </div>
      <div className="space-y-8">
        {Object.entries(byPage).map(([page, pageBlocks]) => (
          <div key={page}>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 capitalize">{page}</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-800">
                  {['Label','Current Value (EN)','Last Edited'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-gray-800/50">
                  {pageBlocks.map(b => (
                    <tr key={b.id} className="hover:bg-gray-800/40">
                      <td className="px-4 py-3 text-gray-300 font-medium">{b.label}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">{b.valueEn || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{b.updatedAt.toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
