'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

type Service = {
  id: string; nameEn: string; nameEs: string
  descriptionEn: string; descriptionEs: string
  price: number | null; priceNote: string | null
  duration: number; imageUrl: string
}

export default function ServicesEditor({ initialServices }: { initialServices: Service[] }) {
  const [services, setServices] = useState(initialServices)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [form, setForm]             = useState<Partial<Service>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile]   = useState<File | null>(null)
  const [saving, setSaving]         = useState(false)
  const [saveError, setSaveError]   = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const openEdit = (svc: Service) => {
    setEditingId(svc.id)
    setForm({ ...svc })
    setImagePreview(null)
    setImageFile(null)
    setSaveError('')
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!editingId) return
    setSaving(true)
    setSaveError('')

    try {
      let res: Response
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        if (form.nameEn)        fd.append('nameEn',        form.nameEn)
        if (form.nameEs)        fd.append('nameEs',        form.nameEs)
        if (form.descriptionEn) fd.append('descriptionEn', form.descriptionEn)
        if (form.descriptionEs) fd.append('descriptionEs', form.descriptionEs)
        if (form.priceNote)     fd.append('priceNote',     form.priceNote)
        if (form.duration)      fd.append('duration',      String(form.duration))
        res = await fetch(`/api/cms/services/${editingId}`, { method: 'PATCH', body: fd })
      } else {
        res = await fetch(`/api/cms/services/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nameEn:        form.nameEn,
            nameEs:        form.nameEs,
            descriptionEn: form.descriptionEn,
            descriptionEs: form.descriptionEs,
            priceNote:     form.priceNote,
            duration:      form.duration,
          }),
        })
      }

      if (res.ok) {
        const { service } = await res.json()
        setServices(prev => prev.map(s => s.id === editingId ? service : s))
        setEditingId(null)
        setImageFile(null)
        setImagePreview(null)
      } else {
        const data = await res.json()
        setSaveError(data.error ?? 'Failed to save')
      }
    } finally {
      setSaving(false)
    }
  }

  const setF = (k: keyof Service, v: unknown) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <>
      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={handleImageSelect} />

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-[10002] flex items-start justify-center bg-black/60 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 space-y-0">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-serif text-xl font-bold text-green-800">Edit Service</h3>
              <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Image */}
              <div>
                <label className="label">Service Image</label>
                <div className="flex gap-4 items-start">
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    <img
                      src={imagePreview ?? form.imageUrl}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <button onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium">
                      📷 {imagePreview ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    <input
                      className="input text-sm"
                      placeholder="Or paste an image URL..."
                      value={imagePreview ? '' : (form.imageUrl ?? '')}
                      onChange={e => { setF('imageUrl', e.target.value); setImageFile(null); setImagePreview(null) }}
                    />
                    <p className="text-xs text-gray-400">Upload replaces the current image. Max 10 MB.</p>
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Name (English) *</label>
                  <input className="input" value={form.nameEn ?? ''} onChange={e => setF('nameEn', e.target.value)} />
                </div>
                <div>
                  <label className="label">Name (Spanish)</label>
                  <input className="input" value={form.nameEs ?? ''} onChange={e => setF('nameEs', e.target.value)} />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="label">Description (English) *</label>
                <textarea className="input resize-none h-24 text-sm" value={form.descriptionEn ?? ''}
                  onChange={e => setF('descriptionEn', e.target.value)} />
              </div>
              <div>
                <label className="label">Description (Spanish)</label>
                <textarea className="input resize-none h-24 text-sm" value={form.descriptionEs ?? ''}
                  onChange={e => setF('descriptionEs', e.target.value)} />
              </div>

              {/* Pricing + Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price Note <span className="text-xs font-normal text-gray-400">(shown to customers)</span></label>
                  <input className="input" value={form.priceNote ?? ''} onChange={e => setF('priceNote', e.target.value)}
                    placeholder="e.g. Starting at $150/hr" />
                </div>
                <div>
                  <label className="label">Duration (minutes)</label>
                  <input className="input" type="number" min="15" step="15"
                    value={form.duration ?? 60} onChange={e => setF('duration', parseInt(e.target.value) || 60)} />
                </div>
              </div>

              {saveError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{saveError}</p>}
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setEditingId(null)}
                className="flex-1 py-3 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 btn-primary py-3 text-sm disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none">
                {saving ? 'Saving…' : '✓ Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service cards with editor controls */}
      <div className="space-y-8">
        {services.map((service, i) => (
          <div key={service.id}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-lg relative ${i % 2 === 0 ? '' : 'lg:flex-row-reverse'}`}>

            {/* Edit button overlay on image */}
            <div className={`relative h-72 lg:h-auto ${i % 2 !== 0 ? 'lg:order-2' : ''}`}>
              <Image src={service.imageUrl} alt={service.nameEn} fill className="object-cover" />
              <button
                onClick={() => openEdit(service)}
                className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 rounded-full px-3 py-1.5 text-xs font-semibold shadow flex items-center gap-1.5 z-10">
                📷 ✎ Edit Service
              </button>
            </div>

            <div className={`bg-white p-8 lg:p-12 flex flex-col justify-center ${i % 2 !== 0 ? 'lg:order-1' : ''}`}>
              <h2 className="font-serif text-3xl font-bold text-green-800 mb-1">{service.nameEn}</h2>
              <p className="text-gray-400 italic text-sm mb-4">{service.nameEs}</p>
              <p className="text-gray-600 leading-relaxed mb-6">{service.descriptionEn}</p>
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-green-50 rounded-xl px-4 py-2">
                  <p className="text-xs text-gray-400">Investment</p>
                  <p className="font-semibold text-green-700 text-sm">
                    {service.priceNote ?? (service.price ? formatCurrency(service.price) : 'Custom quote')}
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl px-4 py-2">
                  <p className="text-xs text-gray-400">Duration</p>
                  <p className="font-semibold text-green-700 text-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" />{service.duration} min
                  </p>
                </div>
              </div>
              <Link href="/booking" className="btn-primary w-fit">
                Book This Service <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
