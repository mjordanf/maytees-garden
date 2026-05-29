'use client'
import { useState } from 'react'
import { Mail, Phone } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

type User = {
  id: string
  name: string | null
  email: string
  role: string
  phone: string | null
  zipCode: string | null
  newsletterOptIn: boolean
  createdAt: Date | string
}

const ROLE_BADGE: Record<string, string> = {
  superadmin: 'bg-amber-100 text-amber-700 border border-amber-300',
  admin:      'bg-green-100 text-green-700',
  staff:      'bg-blue-100 text-blue-700',
  customer:   'bg-gray-100 text-gray-600',
}

const ROLES = ['customer', 'staff', 'admin', 'superadmin']

export default function AdminUsersClient({
  users: initial,
  sessionRole,
  csvHref,
}: {
  users: User[]
  sessionRole: string
  csvHref: string
}) {
  const [users, setUsers] = useState(initial)
  const isSuperAdmin = sessionRole === 'superadmin'

  const updateRole = async (id: string, role: string) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
    }
  }

  const deleteUser = async (id: string, name: string | null) => {
    if (!confirm(`Delete user "${name ?? 'this user'}"? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== id))
    }
  }

  const cols = isSuperAdmin
    ? ['User', 'Contact', 'Role', 'Newsletter', 'Zip', 'Joined', 'Actions']
    : ['User', 'Contact', 'Role', 'Newsletter', 'Zip', 'Joined']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} total users</p>
        </div>
        <a href={csvHref} download="maytees-customers.csv" className="btn-secondary text-sm">
          Export CSV
        </a>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {cols.map(h => (
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
                    {isSuperAdmin ? (
                      <select
                        value={user.role}
                        onChange={e => updateRole(user.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-500 bg-white capitalize"
                      >
                        {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                      </select>
                    ) : (
                      <span className={cn('badge capitalize', ROLE_BADGE[user.role] ?? 'bg-gray-100 text-gray-600')}>{user.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs font-medium', user.newsletterOptIn ? 'text-green-600' : 'text-gray-400')}>
                      {user.newsletterOptIn ? '✓ Subscribed' : '○ No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{user.zipCode ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(user.createdAt)}</td>
                  {isSuperAdmin && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteUser(user.id, user.name)}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
