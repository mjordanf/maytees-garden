import { getContent } from '@/lib/content'
import ContactPageClient from './ContactPageClient'
import EditorOverlay from '@/components/cms/EditorOverlay'
import { cookies } from 'next/headers'

export default async function ContactPage() {
  const content = await getContent('contact')
  const cookieStore = await cookies()
  const isEditorMode = cookieStore.get('cms_editor_mode')?.value === '1'

  return (
    <>
      <ContactPageClient content={content} />
      {isEditorMode && <EditorOverlay page="contact" />}
    </>
  )
}
