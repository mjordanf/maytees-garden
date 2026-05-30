import Link from 'next/link'

export default function NewsletterUnsubscribedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🌿</div>
        <h1 className="font-serif text-2xl font-bold text-gray-800 mb-3">You&apos;ve been unsubscribed</h1>
        <p className="text-gray-500 text-sm mb-6">
          We&apos;re sorry to see you go. You&apos;ve been removed from the Maytee&apos;s Garden newsletter
          and won&apos;t receive any more emails from us.
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
