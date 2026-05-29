'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

function ResetForm() {
  const params   = useSearchParams()
  const router   = useRouter()
  const token    = params.get('token') ?? ''

  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [showPw, setShowPw]         = useState(false)
  const [loading, setLoading]       = useState(false)
  const [done, setDone]             = useState(false)
  const [error, setError]           = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return }

    setLoading(true); setError('')
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (res.ok) {
      setDone(true)
      setTimeout(() => router.push('/auth/login'), 3000)
    } else {
      setError(data.error ?? 'Something went wrong.')
    }
  }

  if (!token) return (
    <div className="text-center py-4">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p className="text-gray-600">Invalid reset link. Please request a new one.</p>
      <Link href="/auth/forgot-password" className="btn-primary mt-4 inline-flex text-sm">Request New Link</Link>
    </div>
  )

  if (done) return (
    <div className="text-center py-4">
      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
      <h2 className="font-serif text-xl font-bold text-green-800 mb-2">Password updated!</h2>
      <p className="text-gray-500 text-sm">Redirecting you to login…</p>
    </div>
  )

  return (
    <>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-5">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">New Password</label>
          <div className="relative">
            <input
              className="input pr-12"
              type={showPw ? 'text' : 'password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <input
            className="input"
            type="password"
            required
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Repeat password"
            autoComplete="new-password"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Updating…' : 'Set New Password'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/logo.jpg" alt="Maytee's Garden" width={56} height={56} className="rounded-full" />
          </Link>
          <h1 className="font-serif text-3xl font-bold text-green-800">Set New Password</h1>
          <p className="text-gray-500 mt-2">Choose a strong password for your account</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <Suspense fallback={<div className="h-40 flex items-center justify-center text-gray-400">Loading…</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
