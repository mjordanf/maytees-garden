import { redirect } from 'next/navigation'
import { FLAGS } from '@/lib/phase-flags'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  if (!FLAGS.SHOW_SHOP) redirect('/')

  return <>{children}</>
}
