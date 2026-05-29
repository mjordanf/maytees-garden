'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2, Key, X, Loader2 } from 'lucide-react'

type User = { id: string; name: string | null; email: string; role: string; phone: string | null; createdAt: Date | string }

const ROLES = ['customer', 'staff', 'admin', 'superadmin']

const ROLE_BADGE: Record<string, string> = {
  superadmin: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  admin:      'bg-green-500/20 text-green-400 border border-green-500/30',
  staff:      'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  customer:   'bg-gray-700 text-gray-400',
}

const BLANK = { name: '', email: '', role: 'admin', password: '', phone: '' }

export default function SuperAdminUsersClient({ users: initial }: { users: User[] }) {
  const [users, setUsers]         = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser]   = useState<User | null>(null)
  const [form, setForm]           = useState(BLANK)
  const [resetId, setResetId]     = useState<string | null>(null)
  const [newPw, setNewPw]         = useState('')
  const [deleteId, setDeleteId]   = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const openAdd = () => { setEditUser(null); setForm(BLANK); setError(''); setShowModal(true) }
  const openEdit = (u: User) => {
    setEditUser(u)
    setForm({ name: u.name ?? '', email: u.email, role: u.role, password: '', phone: u.phone ?? '' })
    setError(''); setShowModal(true)
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    const url    = editUser ? `/api/admin/users/${editUser.id}` : '/api/admin/users'
    const method = editUser ? 'PATCH' : 'POST'
    const body   = editUser
      ? { name: form.name, role: form.role, phone: form.phone }
      : { name: form.name, email: form.email, role: form.role, password: form.password, phone: form.phone }

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }

    if (editUser) {
      setUsers(us => us.map(u => u.id === editUser.id ? { ...u, ...data.user } : u))
    } else {
      setUsers(us => [data.user, ...us])
    }
    setShowModal(false)
  }

  const handleResetPassword = async () => {
    if (!resetId || !newPw) return
    setSaving(true)
    await fetch(`/api/admin/users/${resetId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPw }),
    })
    setSaving(false); setResetId(null); setNewPw('')
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setSaving(true)
    await fetch(`/api/admin/users/${deleteId}`, { method: 'DELETE' })
    setUsers(us => us.filter(u => u.id !== deleteId))
    setSaving(false); setDeleteId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 text-sm mt-1">{users.length} accounts</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg text-sm transition-colors">
          <Plus className="w-4 h-4" /> New Account
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['Name / Email', 'Role', 'Phone', 'Created', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-white font-medium">{u.name ?? '—'}</p>
                  <p className="text-gray-400 text-xs">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_BADGE[u.role] ?? 'bg-gray-700 text-gray-400'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{u.phone ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(u)} title="Edit" className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => { setResetId(u.id); setNewPw('') }} title="Reset password" className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-gray-700 rounded transition-colors">
                      <Key className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteId(u.id)} title="Delete" className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-white font-semibold">{editUser ? 'Edit Account' : 'New Account'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Full Name</label>
                <input className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Carlos Rivera" />
              </div>
              {!editUser && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Email</label>
                  <input className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
                </div>
              )}
              {!editUser && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Password</label>
                  <input className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 characters" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Role</label>
                <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" value={form.role} onChange={e => set('role', e.target.value)}>
                  {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Phone (optional)</label>
                <input className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(305) 555-0000" />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 text-sm border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-800">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 text-sm bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editUser ? 'Save Changes' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Key className="w-4 h-4 text-amber-500" /> Reset Password</h2>
            <input
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 mb-4"
              type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password (min 8 chars)"
            />
            <div className="flex gap-3">
              <button onClick={() => setResetId(null)} className="flex-1 py-2.5 text-sm border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-800">Cancel</button>
              <button onClick={handleResetPassword} disabled={saving || newPw.length < 8} className="flex-1 py-2.5 text-sm bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg disabled:opacity-50">
                {saving ? '…' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-white font-semibold mb-2">Delete Account?</h2>
            <p className="text-gray-400 text-sm mb-5">This action cannot be undone. All data associated with this account will be removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 text-sm border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-800">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="flex-1 py-2.5 text-sm bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg disabled:opacity-50">
                {saving ? '…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
