'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'

type GalleryItem = {
  id: string; imageUrl: string; captionEn: string | null
  captionEs: string | null; category: string; featured: boolean; sortOrder: number
}

const CATEGORIES = ['residential', 'commercial', 'nursery', 'media']

export default function GalleryEditor({ initialItems }: { initialItems: GalleryItem[] }) {
  const [items, setItems]         = useState(initialItems)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editEn, setEditEn]       = useState('')
  const [editEs, setEditEs]       = useState('')
  const [editCat, setEditCat]     = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [saving, setSaving]       = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // New photo form state
  const [showUpload, setShowUpload]     = useState(false)
  const [newFile, setNewFile]           = useState<File | null>(null)
  const [newPreview, setNewPreview]     = useState<string | null>(null)
  const [newCaptionEn, setNewCaptionEn] = useState('')
  const [newCaptionEs, setNewCaptionEs] = useState('')
  const [newCategory, setNewCategory]  = useState('residential')

  const openEdit = (item: GalleryItem) => {
    setEditingId(item.id)
    setEditEn(item.captionEn ?? '')
    setEditEs(item.captionEs ?? '')
    setEditCat(item.category)
  }

  const saveEdit = async () => {
    if (!editingId) return
    setSaving(true)
    const res = await fetch(`/api/cms/gallery/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ captionEn: editEn, captionEs: editEs, category: editCat }),
    })
    if (res.ok) {
      const { item } = await res.json()
      setItems(prev => prev.map(i => i.id === editingId ? { ...i, ...item } : i))
      setEditingId(null)
    }
    setSaving(false)
  }

  const confirmDelete = async () => {
    if (!deletingId) return
    const res = await fetch(`/api/cms/gallery/${deletingId}`, { method: 'DELETE' })
    if (res.ok) {
      setItems(prev => prev.filter(i => i.id !== deletingId))
      setDeletingId(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setNewFile(file)
    setNewPreview(URL.createObjectURL(file))
    setShowUpload(true)
  }

  const uploadPhoto = async () => {
    if (!newFile) return
    setUploading(true)
    setUploadError('')
    const fd = new FormData()
    fd.append('file', newFile)
    fd.append('captionEn', newCaptionEn)
    fd.append('captionEs', newCaptionEs)
    fd.append('category',  newCategory)
    const res = await fetch('/api/cms/gallery', { method: 'POST', body: fd })
    const data = await res.json()
    if (res.ok) {
      setItems(prev => [...prev, data.item])
      setShowUpload(false)
      setNewFile(null)
      setNewPreview(null)
      setNewCaptionEn('')
      setNewCaptionEs('')
      setNewCategory('residential')
      if (fileRef.current) fileRef.current.value = ''
    } else {
      setUploadError(data.error ?? 'Upload failed')
    }
    setUploading(false)
  }

  return (
    <>
      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={handleFileSelect} />

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-green-800">Add to Gallery</h3>
            {newPreview && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
                <img src={newPreview} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <label className="label">Caption (English) *</label>
              <input className="input" value={newCaptionEn} onChange={e => setNewCaptionEn(e.target.value)}
                placeholder="e.g. Coral Gables Backyard Transformation" />
            </div>
            <div>
              <label className="label">Caption (Spanish)</label>
              <input className="input" value={newCaptionEs} onChange={e => setNewCaptionEs(e.target.value)}
                placeholder="e.g. Transformación de Patio en Coral Gables" />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
            {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
            <div className="flex gap-3">
              <button onClick={() => { setShowUpload(false); setNewFile(null); setNewPreview(null) }}
                className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={uploadPhoto} disabled={uploading || !newCaptionEn.trim()}
                className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none">
                {uploading ? 'Uploading…' : 'Add to Gallery'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit caption modal */}
      {editingId && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-serif text-lg font-bold text-green-800">Edit Photo Details</h3>
            <div>
              <label className="label">Caption (English)</label>
              <input className="input" value={editEn} onChange={e => setEditEn(e.target.value)} />
            </div>
            <div>
              <label className="label">Caption (Spanish)</label>
              <input className="input" value={editEs} onChange={e => setEditEs(e.target.value)} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={editCat} onChange={e => setEditCat(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingId(null)}
                className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 btn-primary py-2.5 text-sm disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none">
                {saving ? 'Saving…' : '✓ Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deletingId && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-serif text-lg font-bold text-gray-800 mb-2">Remove from Gallery?</h3>
            <p className="text-sm text-gray-500 mb-5">This will remove the photo from the gallery. The image file will remain on disk.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-2.5 text-sm bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gallery grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {items.map((item, i) => (
          <div key={item.id}
            className={`break-inside-avoid rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group cursor-pointer relative ${i % 5 === 0 ? 'aspect-video' : 'aspect-square'}`}>
            <Image src={item.imageUrl} alt={item.captionEn ?? 'Gallery photo'}
              unoptimized fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <p className="text-white font-serif font-bold text-sm">{item.captionEn}</p>
              <span className="text-white/70 text-xs capitalize">{item.category}</span>
            </div>
            {/* Editor controls — always visible in editor mode */}
            <div className="absolute top-2 right-2 flex gap-1.5 z-10">
              <button onClick={(e) => { e.stopPropagation(); openEdit(item) }}
                className="bg-white/90 hover:bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-sm transition-all"
                title="Edit caption">
                ✎
              </button>
              <button onClick={(e) => { e.stopPropagation(); setDeletingId(item.id) }}
                className="bg-red-500/90 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-sm transition-all"
                title="Remove">
                ×
              </button>
            </div>
          </div>
        ))}

        {/* Add Photo tile */}
        <div
          onClick={() => fileRef.current?.click()}
          className="break-inside-avoid rounded-2xl overflow-hidden shadow-md border-2 border-dashed border-green-400 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer aspect-square flex flex-col items-center justify-center gap-3 group">
          <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-light group-hover:scale-110 transition-transform">
            +
          </div>
          <div className="text-center">
            <p className="text-green-800 font-semibold text-sm">Add Photo</p>
            <p className="text-green-600 text-xs mt-0.5">JPG, PNG, WebP · max 15 MB</p>
          </div>
        </div>
      </div>
    </>
  )
}
