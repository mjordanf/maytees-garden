'use client'
import { useState, useRef } from 'react'

type ImageBlock = { id: string; key: string; label: string; valueEn: string }

export default function AboutImageEditor({ blocks }: { blocks: ImageBlock[] }) {
  const [images, setImages] = useState<Record<string, string>>(
    Object.fromEntries(blocks.map(b => [b.key, b.valueEn]))
  )
  const [uploading, setUploading] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const pendingKey = useRef<string | null>(null)
  const pendingId  = useRef<string | null>(null)

  const triggerUpload = (key: string, id: string) => {
    pendingKey.current = key
    pendingId.current  = id
    fileRef.current?.click()
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const key  = pendingKey.current
    const id   = pendingId.current
    if (!file || !key || !id) return

    setUploading(key)
    const fd = new FormData()
    fd.append('file', file)

    // Upload the file
    const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
    if (uploadRes.ok) {
      const { url } = await uploadRes.json()
      // Save the new URL to the content block
      await fetch(`/api/cms/blocks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valueEn: url, valueEs: url }),
      })
      setImages(prev => ({ ...prev, [key]: url }))

      // Update the actual DOM image element
      const el = document.querySelector(`[data-cms-img="${key}"]`) as HTMLImageElement | null
      if (el) el.src = url
    }

    setUploading(null)
    e.target.value = ''
  }

  if (!blocks.length) return null

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={handleFile} />

      {blocks.map(block => {
        const container = document.querySelector(`[data-cms-img-container="${block.key}"]`) as HTMLElement | null
        if (!container) return null
        return null // Positioning is handled via CSS overlay below
      })}

      {/* Inject overlay buttons via a style-based approach.
          The actual buttons are rendered as siblings in the about page markup. */}
      <style>{`
        [data-cms-img-container] { position: relative !important; }
        [data-cms-img-container]::after {
          content: none;
        }
      `}</style>
    </>
  )
}

// Export a simpler button component for inline use
export function ImageReplaceButton({
  blockKey, blockId, label
}: { blockKey: string; blockId: string; label: string }) {
  const [uploading, setUploading] = useState(false)
  const [done, setDone]           = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
    if (uploadRes.ok) {
      const { url } = await uploadRes.json()
      await fetch(`/api/cms/blocks/${blockId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valueEn: url, valueEs: url }),
      })
      // Update DOM image
      const img = document.querySelector(`[data-cms-img="${blockKey}"]`) as HTMLImageElement | null
      if (img) img.src = url
      setDone(true)
      setTimeout(() => setDone(false), 2000)
    }
    setUploading(false)
    e.target.value = ''
  }

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={handleFile} />
      <button
        onClick={() => fileRef.current?.click()}
        className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white text-gray-700 rounded-full px-2.5 py-1 text-xs font-semibold shadow flex items-center gap-1 transition-all"
        title={`Replace ${label}`}>
        {uploading ? '⏳' : done ? '✓' : '📷'} {uploading ? 'Uploading…' : done ? 'Done!' : 'Replace'}
      </button>
    </>
  )
}
