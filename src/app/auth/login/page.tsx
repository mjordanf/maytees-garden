'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) setError('Invalid email or password. Please try again.')
    else router.push('/portal')
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/logo.jpg" alt="Maytee's Garden" width={56} height={56} className="rounded-full" />
          </Link>
          <h1 className="font-serif text-3xl font-bold text-green-800">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Log in to your account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" name="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="label mb-0">Password</label>
                <a href="#" className="text-xs text-green-600 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input className="input pr-12" type={showPw ? 'text' : 'password'} name="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-green-600 font-semibold hover:underline">Sign up free</Link>
            </p>
          </div>

          {/* Test credentials hint */}
          <div className="mt-4 bg-green-50 rounded-xl p-3 text-xs text-green-700">
            <p className="font-semibold mb-1">🧪 Test accounts:</p>
            <p>Admin: maytee@mayteesgarden.com / Admin2024!</p>
            <p>Customer: test@customer.com / Customer2024!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
