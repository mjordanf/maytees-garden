import { cookies } from 'next/headers'
import { getContent, c } from '@/lib/content'
import ContactPageClient from './ContactPageClient'
import EditorOverlay from '@/components/cms/EditorOverlay'

export default async function ContactPage() {
  const content = await getContent('contact')
  const cookieStore = await cookies()
  const isEditorMode = cookieStore.get('cms_editor_mode')?.value === '1'

  const title    = c(content, 'contact.title',    'Get in Touch')
  const subtitle = c(content, 'contact.subtitle', "Ready to transform your garden? Tell us about your space and we'll be in touch within 24 hours.")
  const address  = c(content, 'contact.info.address', '15196 SW 184th St\nMiami, FL 33187')
  const hours    = c(content, 'contact.info.hours',   'Monday–Sunday: 9 AM – 5:30 PM\nFriday–Saturday: until 6 PM')
  const phone    = c(content, 'contact.info.phone',   '(786) 227-6616')
  const email    = c(content, 'contact.info.email',   'info@mayteesgardencenter.com')

  return (
    <>
      <ContactPageClient
        title={title} subtitle={subtitle}
        address={address} hours={hours} phone={phone} email={email}
      />
      {isEditorMode && <EditorOverlay page="contact" />}
    </>
  )
}
