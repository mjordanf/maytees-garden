export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Shield } from 'lucide-react'

export default async function AdminLogsPage() {
  const logs = await prisma.auditLog.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' }, take: 100 })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-green-600" />
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">Audit Logs</h1>
          <p className="text-gray-500 text-sm mt-1">Last 100 system events — read only</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Timestamp','User','Action','Entity','Details'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-700 text-xs">{log.user?.email ?? 'Anonymous'}</td>
                <td className="px-4 py-3"><span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{log.action}</span></td>
                <td className="px-4 py-3 text-gray-600 text-xs">{log.entity}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{log.details ?? log.entityId ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="text-center text-gray-400 py-8">No audit logs yet</p>}
      </div>
    </div>
  )
}
