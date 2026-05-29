export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Users, Mail, Phone } from 'lucide-react'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })

  const roleColors: Record<string,string> = {
    admin:    'bg-purple-100 text-purple-700',
    staff:    'bg-blue-100 text-blue-700',
    customer: 'bg-green-100 text-green-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} total users</p>
        </div>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(
            ['Name','Email','Phone','Role','Newsletter','Created'].join(',') + '\n' +
            users.map(u => [u.name??'',u.email,u.phone??'',u.role,u.newsletterOptIn,'',formatDate(u.createdAt)].join(',')).join('\n')
          )}`}
          download="maytees-customers.csv"
          className="btn-secondary text-sm"
        >
          Export CSV
        </a>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['User','Contact','Role','Newsletter','Zip','Joined'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-xs font-bold">
                        {user.name?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <p className="font-semibold text-gray-800">{user.name ?? 'Unnamed'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-1 text-gray-700"><Mail className="w-3 h-3" />{user.email}</p>
                    {user.phone && <p className="flex items-center gap-1 text-gray-400 text-xs mt-0.5"><Phone className="w-3 h-3" />{user.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge capitalize ${roleColors[user.role] ?? 'bg-gray-100 text-gray-600'}`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${user.newsletterOptIn ? 'text-green-600' : 'text-gray-400'}`}>
                      {user.newsletterOptIn ? '✓ Subscribed' : '○ No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{user.zipCode ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
