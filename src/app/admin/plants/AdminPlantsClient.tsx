'use client'
import { useState, useRef } from 'react'
import { Plus, Pencil, Trash2, Camera, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

type Plant = {
  id: string; nameEn: string; nameEs: string
  descriptionEn: string; descriptionEs: string
  price: number; imageUrl: string; category: string
  inStock: boolean; stockQty: number; featured: boolean; tags: string
  careLevel: string; sunlight: string; water: string
  onlineStock: number; onsiteStock: number
  onlinePrice: number | null | undefined; weight: number | null | undefined
  shippingClass: string | null | undefined
}
type PlantForm = Omit<Plant, 'id'>

const CATEGORIES  = ['tropical','flowering','palms','succulents','edible','native']
const CARE_LEVELS = ['easy','moderate','expert']
const SUNLIGHT    = ['full','partial','shade']
const WATER       = ['low','moderate','high']

const PLANT_NAMES = [
  'Adenium','African Iris','African Tulip Tree','Air Plant','Aloe Vera',
  'Alpinia','Anthurium','Areca Palm','Avocado Tree','Banana Tree',
  'Bauhinia','Bird of Paradise','Bismarck Palm','Blue Daze','Bougainvillea',
  'Bromeliad','Buttonwood','Caladium','Calathea','Canna Lily',
  'Christmas Palm','Clusia','Coconut Palm','Confederate Jasmine',
  'Coral Honeysuckle','Costus','Croton','Crown of Thorns',
  'Dieffenbachia','Dracaena','Dwarf Bougainvillea','Dwarf Ixora',
  'Dwarf Olive Tree','Echeveria','Fakahatchee Grass','Fiddle Leaf Fig',
  'Firebush','Fishtail Palm','Foxtail Palm','Frangipani','Gardenia',
  'Ginger','Heliconia','Hibiscus','Ixora','Jasmine','Jatropha',
  'Lantana','Lemon Tree','Lime Tree','Liriope','Mango Tree','Mangrove',
  'Mexican Fan Palm','Monstera Deliciosa','Muhly Grass','Mussaenda',
  'Orange Tree','Orchid','Papaya','Peace Lily','Pentas','Philodendron',
  'Plumbago','Plumeria','Podocarpus','Portulaca','Pothos','Queen Palm',
  'Royal Palm','Royal Poinciana','Rubber Plant','Sabal Palm','Sago Palm',
  'Salvia','Saw Palmetto','Schefflera','Sea Grape','Sedum','Snake Plant',
  'Star Jasmine','Strelitzia','Sweet Potato Vine','Thryallis',
  "Traveler's Palm",'Variegated Ginger','Washingtonia Palm','Windmill Palm',
  'Yellow Elder','ZZ Plant',
]

const SHIPPING_CLASSES = ['standard', 'fragile', 'large']

const BLANK: PlantForm = {
  nameEn:'', nameEs:'', descriptionEn:'', descriptionEs:'',
  price: 25, imageUrl:'', category:'tropical',
  inStock: true, stockQty: 10, featured: false, tags:'',
  careLevel:'easy', sunlight:'full', water:'moderate',
  onlineStock: 0, onsiteStock: 0, onlinePrice: undefined, weight: undefined,
  shippingClass: 'standard',
}

async function fetchPlantImage(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`,
    )
    if (!res.ok) return null
    const data = await res.json()
    // Prefer thumbnail (fast, reasonable size), bump to 800px; fall back to original
    const thumb = data.thumbnail?.source as string | undefined
    const original = data.originalimage?.source as string | undefined
    if (thumb) return thumb.replace('/thumb/', '/').replace(/\/\d+px-[^/]+$/, '')
    if (original) return original
    return null
  } catch {
    return null
  }
}

type ImgStatus = 'idle' | 'searching' | 'found' | 'notfound' | 'uploaded'

export default function AdminPlantsClient({ initialPlants }: { initialPlants: Plant[] }) {
  const { lang } = useI18n()
  const isEs = lang === 'es'

  const [plants, setPlants]       = useState(initialPlants)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<Plant | null>(null)
  const [deleteId, setDeleteId]   = useState<string | null>(null)
  const [form, setForm]           = useState<PlantForm>(BLANK)
  const [imgError, setImgError]   = useState(false)
  const [imgStatus, setImgStatus] = useState<ImgStatus>('idle')
  const [saving, setSaving]       = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleting, setDeleting]   = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const fileRef   = useRef<HTMLInputElement>(null)
  const timerRef  = useRef<ReturnType<typeof setTimeout>>()
  // Inline stock editing
  const [editingStockId, setEditingStockId] = useState<string | null>(null)
  const [editingStockField, setEditingStockField] = useState<'onlineStock' | 'onsiteStock' | null>(null)
  const [stockInputVal, setStockInputVal] = useState<string>('')

  const set = <K extends keyof PlantForm>(k: K, v: PlantForm[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  // Auto-search Wikipedia for an image whenever the primary name changes
  const scheduleImageSearch = (name: string) => {
    clearTimeout(timerRef.current)
    if (name.length < 3) return
    const delay = PLANT_NAMES.includes(name) ? 0 : 700   // instant on exact match
    timerRef.current = setTimeout(async () => {
      setImgStatus('searching')
      const url = await fetchPlantImage(name)
      if (url) {
        set('imageUrl', url)
        setImgError(false)
        setImgStatus('found')
      } else {
        setImgStatus('notfound')
      }
    }, delay)
  }

  const handleNameChange = (value: string) => {
    if (isEs) {
      set('nameEs', value)
      if (PLANT_NAMES.includes(value)) set('nameEn', value)
    } else {
      set('nameEn', value)
      if (PLANT_NAMES.includes(value)) set('nameEs', value)
    }
    scheduleImageSearch(value)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    if (res.ok) {
      const { url } = await res.json()
      set('imageUrl', url)
      setImgError(false)
      setImgStatus('uploaded')
    }
    setUploadingImg(false)
    e.target.value = ''
  }

  const openAdd = () => {
    setEditing(null); setForm(BLANK); setImgError(false)
    setImgStatus('idle'); setSaveError(null); setShowModal(true)
  }

  const openEdit = (p: Plant) => {
    setEditing(p)
    const { id: _id, ...rest } = p
    setForm({
      ...rest,
      stockQty: rest.stockQty ?? 10,
      onlineStock: rest.onlineStock ?? 0,
      onsiteStock: rest.onsiteStock ?? 0,
    }); setImgError(false)
    setImgStatus(p.imageUrl ? 'found' : 'idle'); setSaveError(null); setShowModal(true)
  }

  const startStockEdit = (plantId: string, field: 'onlineStock' | 'onsiteStock', current: number) => {
    setEditingStockId(plantId)
    setEditingStockField(field)
    setStockInputVal(String(current))
  }

  const saveStockEdit = async (plantId: string) => {
    const val = parseInt(stockInputVal) || 0
    const field = editingStockField
    if (!field) return
    const res = await fetch(`/api/plants/${plantId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: val }),
    })
    if (res.ok) {
      const { plant } = await res.json()
      setPlants(ps => ps.map(p => p.id === plantId ? { ...p, [field]: plant[field] } : p))
    }
    setEditingStockId(null)
    setEditingStockField(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    // Auto-fill the other language if blank, so DB non-null constraints are satisfied
    const payload: PlantForm = {
      ...form,
      nameEn: form.nameEn || form.nameEs,
      nameEs: form.nameEs || form.nameEn,
      descriptionEn: form.descriptionEn || form.descriptionEs,
      descriptionEs: form.descriptionEs || form.descriptionEn,
    }
    try {
      if (editing) {
        const res = await fetch(`/api/plants/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.status === 409) {
          const { error } = await res.json()
          setSaveError(error)
          return
        }
        const { plant } = await res.json()
        setPlants(ps => ps.map(p => p.id === plant.id ? plant : p))
      } else {
        const res = await fetch('/api/plants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.status === 409) {
          const { error } = await res.json()
          setSaveError(error)
          return
        }
        const { plant } = await res.json()
        setPlants(ps => [plant, ...ps])
      }
      setShowModal(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    await fetch(`/api/plants/${deleteId}`, { method: 'DELETE' })
    setPlants(ps => ps.filter(p => p.id !== deleteId))
    setDeleteId(null)
    setDeleting(false)
  }

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  // The name field value and label depend on current locale
  const nameValue = isEs ? form.nameEs : form.nameEn
  const descValue = isEs ? form.descriptionEs : form.descriptionEn
  const namePlaceholder = isEs ? 'ej. Buganvilla, Palma, Croton…' : 'e.g. Bougainvillea, Areca Palm…'
  const descPlaceholder = isEs
    ? 'Describe la planta, su apariencia y cómo crece en el sur de Florida…'
    : 'Describe the plant, its appearance, and how it grows in South Florida…'

  const canSave = (isEs ? form.nameEs : form.nameEn).trim() &&
                  form.imageUrl.trim() &&
                  (isEs ? form.descriptionEs : form.descriptionEn).trim()

  const imgStatusBadge = () => {
    if (imgStatus === 'searching') return (
      <span className="flex items-center gap-1.5 text-xs text-gray-400">
        <Loader2 className="w-3 h-3 animate-spin" /> {isEs ? 'Buscando imagen…' : 'Finding image…'}
      </span>
    )
    if (imgStatus === 'found') return (
      <span className="flex items-center gap-1.5 text-xs text-green-600">
        <CheckCircle className="w-3 h-3" /> {isEs ? 'Imagen encontrada automáticamente' : 'Image found automatically'}
      </span>
    )
    if (imgStatus === 'uploaded') return (
      <span className="flex items-center gap-1.5 text-xs text-green-600">
        <CheckCircle className="w-3 h-3" /> {isEs ? 'Foto subida' : 'Photo uploaded'}
      </span>
    )
    if (imgStatus === 'notfound') return (
      <span className="flex items-center gap-1.5 text-xs text-amber-500">
        <AlertCircle className="w-3 h-3" /> {isEs ? 'No se encontró imagen — sube una foto' : 'No image found — upload a photo below'}
      </span>
    )
    return (
      <span className="text-xs text-gray-400">
        {isEs ? 'La imagen se busca automáticamente al escribir el nombre' : 'Image is found automatically as you type the name'}
      </span>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">
            {isEs ? 'Catálogo de Plantas' : 'Plant Catalog'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {plants.length} {isEs ? 'plantas en el catálogo' : 'plants in catalog'}
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> {isEs ? 'Agregar Planta' : 'Add Plant'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {(isEs
                  ? ['Planta','Categoría','Precio','Online Stock','Onsite Stock','Disponibilidad','Destacada','Acciones']
                  : ['Plant','Category','Price','Online Stock','Onsite Stock','Availability','Featured','Actions']
                ).map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {plants.map(plant => (
                <tr key={plant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        <img src={plant.imageUrl} alt={plant.nameEn} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{isEs ? plant.nameEs : plant.nameEn}</p>
                        <p className="text-xs text-gray-400 italic">{isEs ? plant.nameEn : plant.nameEs}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge badge-green capitalize">{plant.category}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700">{formatCurrency(plant.price)}</td>
                  {/* Online Stock — click to edit */}
                  <td className="px-4 py-3">
                    {editingStockId === plant.id && editingStockField === 'onlineStock' ? (
                      <input
                        autoFocus
                        type="number" min="0"
                        className="w-16 text-xs border border-gray-300 rounded px-2 py-1"
                        value={stockInputVal}
                        onChange={e => setStockInputVal(e.target.value)}
                        onBlur={() => saveStockEdit(plant.id)}
                        onKeyDown={e => e.key === 'Enter' && saveStockEdit(plant.id)}
                      />
                    ) : (
                      <button onClick={() => startStockEdit(plant.id, 'onlineStock', plant.onlineStock ?? 0)} className="text-left">
                        {(plant.onlineStock ?? 0) === 0
                          ? <span className="text-xs font-semibold text-red-500">Out of Stock</span>
                          : (plant.onlineStock ?? 0) <= 3
                          ? <span className="text-xs font-semibold text-amber-500">Low ({plant.onlineStock})</span>
                          : <span className="text-xs font-semibold text-green-700">{plant.onlineStock}</span>
                        }
                      </button>
                    )}
                  </td>
                  {/* Onsite Stock — click to edit */}
                  <td className="px-4 py-3">
                    {editingStockId === plant.id && editingStockField === 'onsiteStock' ? (
                      <input
                        autoFocus
                        type="number" min="0"
                        className="w-16 text-xs border border-gray-300 rounded px-2 py-1"
                        value={stockInputVal}
                        onChange={e => setStockInputVal(e.target.value)}
                        onBlur={() => saveStockEdit(plant.id)}
                        onKeyDown={e => e.key === 'Enter' && saveStockEdit(plant.id)}
                      />
                    ) : (
                      <button onClick={() => startStockEdit(plant.id, 'onsiteStock', plant.onsiteStock ?? 0)} className="text-left">
                        <span className="text-xs text-gray-500">{plant.onsiteStock ?? 0}</span>
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${plant.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                      {plant.inStock ? (isEs ? 'Disponible' : 'In Stock') : (isEs ? 'Agotado' : 'Out of Stock')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={plant.featured ? 'text-yellow-500 font-medium text-xs' : 'text-gray-300 text-xs'}>
                      {plant.featured ? '★' : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openEdit(plant)}
                        className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
                      >
                        <Pencil className="w-3 h-3" /> {isEs ? 'Editar' : 'Edit'}
                      </button>
                      <button
                        onClick={() => setDeleteId(plant.id)}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-medium"
                      >
                        <Trash2 className="w-3 h-3" /> {isEs ? 'Eliminar' : 'Remove'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-gray-800 mb-2">
              {isEs ? '¿Eliminar planta?' : 'Remove Plant?'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {isEs
                ? 'Esto eliminará permanentemente la planta del catálogo.'
                : 'This will permanently delete this plant from the catalog.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
              >
                {isEs ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? '…' : (isEs ? 'Eliminar' : 'Remove')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-serif text-xl font-bold text-green-800">
                {editing
                  ? (isEs ? 'Editar Planta' : 'Edit Plant')
                  : (isEs ? 'Agregar Planta' : 'Add Plant')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">

              {/* ── Plant Name (primary field — triggers image search) ── */}
              <div>
                <label className="label">
                  {isEs ? 'Nombre de la Planta *' : 'Plant Name *'}
                </label>
                <input
                  className="input"
                  list="plant-names-list"
                  value={nameValue}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder={namePlaceholder}
                  autoComplete="off"
                />
                <datalist id="plant-names-list">
                  {PLANT_NAMES.map(n => <option key={n} value={n} />)}
                </datalist>
              </div>

              {/* ── Image (auto-found from name, or uploaded) ── */}
              <div>
                <label className="label">{isEs ? 'Imagen' : 'Plant Image'}</label>
                <div className="flex gap-4 items-center">
                  {/* Preview */}
                  <div className="w-24 h-24 rounded-xl shrink-0 overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
                    {imgStatus === 'searching'
                      ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      : form.imageUrl && !imgError
                        ? <img
                            src={form.imageUrl}
                            alt="preview"
                            className="w-full h-full object-cover"
                            onError={() => { setImgError(true); setImgStatus('notfound') }}
                          />
                        : <Camera className="w-6 h-6 text-gray-300" />
                    }
                  </div>

                  <div className="flex-1 space-y-2">
                    {imgStatusBadge()}
                    <div>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploadingImg}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-40 font-medium"
                      >
                        {uploadingImg
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Camera className="w-3 h-3" />
                        }
                        {isEs ? 'Subir / Cámara' : 'Upload / Camera'}
                      </button>
                      {/* capture="environment" uses the rear camera on mobile */}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Description (current locale only) ── */}
              <div>
                <label className="label">{isEs ? 'Descripción *' : 'Description *'}</label>
                <textarea
                  className="input resize-none h-24 text-sm"
                  value={descValue}
                  onChange={e => isEs ? set('descriptionEs', e.target.value) : set('descriptionEn', e.target.value)}
                  placeholder={descPlaceholder}
                />
              </div>

              {/* ── Category + Price + Stock Qty ── */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">{isEs ? 'Categoría *' : 'Category *'}</label>
                  <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{cap(c)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{isEs ? 'Precio ($) *' : 'Price ($) *'}</label>
                  <input
                    className="input"
                    type="number" min="0" step="0.01"
                    value={form.price}
                    onChange={e => set('price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="label">{isEs ? 'Cantidad en Stock' : 'Stock Quantity'}</label>
                  <input
                    className="input"
                    type="number" min="0" step="1"
                    value={form.stockQty}
                    onChange={e => set('stockQty', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* ── Online Inventory ── */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Online Stock</label>
                  <input
                    className="input"
                    type="number" min="0" step="1"
                    value={form.onlineStock ?? 0}
                    onChange={e => set('onlineStock', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="label">Onsite Stock</label>
                  <input
                    className="input"
                    type="number" min="0" step="1"
                    value={form.onsiteStock ?? 0}
                    onChange={e => set('onsiteStock', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* ── Online Price + Shipping ── */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">
                    Online Price ($)
                    <span className="text-xs font-normal text-gray-400 ml-1">(optional)</span>
                  </label>
                  <input
                    className="input"
                    type="number" min="0" step="0.01"
                    placeholder={`Same as base ($${form.price})`}
                    value={form.onlinePrice ?? ''}
                    onChange={e => set('onlinePrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <label className="label">
                    Weight (oz)
                    <span className="text-xs font-normal text-gray-400 ml-1">(optional)</span>
                  </label>
                  <input
                    className="input"
                    type="number" min="0" step="0.1"
                    value={form.weight ?? ''}
                    onChange={e => set('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="16"
                  />
                </div>
                <div>
                  <label className="label">Shipping Class</label>
                  <select className="input" value={form.shippingClass ?? 'standard'} onChange={e => set('shippingClass', e.target.value)}>
                    {SHIPPING_CLASSES.map(c => <option key={c} value={c}>{cap(c)}</option>)}
                  </select>
                </div>
              </div>

              {/* ── Care details ── */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">{isEs ? 'Nivel de Cuidado' : 'Care Level'}</label>
                  <select className="input" value={form.careLevel} onChange={e => set('careLevel', e.target.value)}>
                    {CARE_LEVELS.map(c => <option key={c} value={c}>{cap(c)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{isEs ? 'Luz Solar' : 'Sunlight'}</label>
                  <select className="input" value={form.sunlight} onChange={e => set('sunlight', e.target.value)}>
                    {SUNLIGHT.map(s => <option key={s} value={s}>{cap(s)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{isEs ? 'Agua' : 'Water'}</label>
                  <select className="input" value={form.water} onChange={e => set('water', e.target.value)}>
                    {WATER.map(w => <option key={w} value={w}>{cap(w)}</option>)}
                  </select>
                </div>
              </div>

              {/* ── Tags ── */}
              <div>
                <label className="label">
                  Tags <span className="text-xs font-normal text-gray-400">(comma-separated)</span>
                </label>
                <input
                  className="input"
                  value={form.tags}
                  onChange={e => set('tags', e.target.value)}
                  placeholder="tropical, colorful, drought-tolerant"
                />
              </div>

              {/* ── Toggles ── */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={form.inStock} onChange={e => set('inStock', e.target.checked)} className="w-4 h-4 accent-green-600" />
                  <span className="text-sm font-medium text-gray-700">{isEs ? 'Disponible' : 'In Stock'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 accent-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">{isEs ? 'Destacada' : 'Featured'}</span>
                </label>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 pb-6 space-y-3">
              {saveError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {saveError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-sm border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
                >
                  {isEs ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !canSave}
                  className="flex-1 btn-primary py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
                >
                  {saving ? '…' : editing ? (isEs ? 'Guardar Cambios' : 'Save Changes') : (isEs ? 'Agregar Planta' : 'Add Plant')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
