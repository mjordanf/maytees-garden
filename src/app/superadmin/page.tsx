export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { Users, Shield, Settings } from 'lucide-react'
import Link from 'next/link'

export default async function SuperAdminDashboard() {
  const [totalUsers, adminCount, staffCount] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'admin' } }),
    prisma.user.count({ where: { role: 'staff' } }),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Super Admin Dashboard</h1>
        <p className="text-gray-400 mt-1 text-sm">Website product administration — manage accounts and configuration.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Users',   value: totalUsers,  color: 'text-blue-400'  },
          { label: 'Admin Accounts', value: adminCount, color: 'text-green-400' },
          { label: 'Staff Accounts', value: staffCount, color: 'text-purple-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-gray-400 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/superadmin/users" className="bg-gray-900 border border-gray-800 hover:border-amber-500/50 rounded-xl p-6 transition-colors group">
          <Users className="w-8 h-8 text-amber-500 mb-3" />
          <h3 className="text-white font-semibold mb-1">User Management</h3>
          <p className="text-gray-400 text-sm">Create, edit, and delete admin and staff accounts. Reset passwords.</p>
        </Link>
        <Link href="/superadmin/settings" className="bg-gray-900 border border-gray-800 hover:border-amber-500/50 rounded-xl p-6 transition-colors group">
          <Settings className="w-8 h-8 text-amber-500 mb-3" />
          <h3 className="text-white font-semibold mb-1">Website Settings</h3>
          <p className="text-gray-400 text-sm">Configure general website settings, contact details, and preferences.</p>
        </Link>
      </div>
    </div>
  )
}
