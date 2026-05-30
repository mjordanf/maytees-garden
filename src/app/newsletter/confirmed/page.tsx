import Link from 'next/link'

export default function NewsletterConfirmedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="font-serif text-2xl font-bold text-green-800 mb-3">You&apos;re subscribed!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Thank you for joining the Maytee&apos;s Garden newsletter. We&apos;ll send you seasonal plant tips,
          garden inspiration, and exclusive updates.
        </p>
        <Link
          href="/"
          className="inline-block bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
