'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FLAGS } from '@/lib/phase-flags'

export default function RegisterPage() {
  if (!FLAGS.SHOW_REGISTER) redirect('/')

  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', zip: '', phone: '', newsletter: false })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Registration failed. Please try again.')
      setLoading(false); return
    }

    await signIn('credentials', { email: form.email, password: form.password, redirect: false })
    router.push('/portal')
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/logo.jpg" alt="Maytee's Garden" width={56} height={56} className="rounded-full" />
          </Link>
          <h1 className="font-serif text-3xl font-bold text-green-800">Create Your Account</h1>
          <p className="text-gray-500 mt-2">Join the Maytee's Garden community</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-5">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Maria Santos" />
            </div>
            <div>
              <label className="label">Email Address *</label>
              <input className="input" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="maria@email.com" />
            </div>
            <div>
              <label className="label">Password *</label>
              <input className="input" type="password" required minLength={8} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Minimum 8 characters" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(305) 555-0000" />
              </div>
              <div>
                <label className="label">Zip Code</label>
                <input className="input" value={form.zip} onChange={e => set('zip', e.target.value)} placeholder="33187" />
              </div>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.newsletter} onChange={e => set('newsletter', e.target.checked)} className="mt-0.5 text-green-600 rounded" />
              <span className="text-sm text-gray-600">Subscribe to plant tips, seasonal specials, and garden inspiration from Maytee</span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-green-600 font-semibold hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
