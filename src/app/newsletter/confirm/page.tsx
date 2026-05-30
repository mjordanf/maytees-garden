export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { CheckCircle, XCircle } from 'lucide-react'

export default async function NewsletterConfirmPage({
  searchParams,
}: {
  searchParams: { token?: string; error?: string }
}) {
  const token = searchParams.token

  let status: 'success' | 'already' | 'error' = 'error'

  if (token) {
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { confirmToken: token },
    })

    if (!subscriber) {
      // Token not found — already confirmed (token cleared) or truly invalid
      status = 'already'
    } else {
      await prisma.newsletterSubscriber.update({
        where: { id: subscriber.id },
        data:  { confirmed: true, confirmToken: null },
      })
      status = 'success'
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center">
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-green-800 mb-3">You're subscribed!</h1>
            <p className="text-gray-600 mb-2">
              Welcome to Maytee's Garden newsletter. You'll receive seasonal plant tips, garden inspiration, and exclusive updates.
            </p>
            <p className="text-sm text-gray-400 mb-8">You can unsubscribe at any time using the link at the bottom of any newsletter.</p>
            <Link href="/" className="btn-primary">Back to Maytee's Garden</Link>
          </>
        )}

        {(status === 'already') && (
          <>
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-blue-500" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-green-800 mb-3">Already confirmed</h1>
            <p className="text-gray-600 mb-8">This subscription is already active. You're all set!</p>
            <Link href="/" className="btn-primary">Back to Maytee's Garden</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="font-serif text-3xl font-bold text-gray-700 mb-3">Link expired</h1>
            <p className="text-gray-600 mb-8">
              This confirmation link is invalid or has already been used. Subscribe again from the website to get a new link.
            </p>
            <Link href="/" className="btn-primary">Back to Maytee's Garden</Link>
          </>
        )}
      </div>
    </div>
  )
}
