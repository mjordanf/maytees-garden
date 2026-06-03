'use client'
import { useState, useEffect, useRef } from 'react'

interface Block {
  id: string; key: string; label: string; type: string
  valueEn: string; valueEs: string
}
interface Version {
  id: string; valueEn: string; valueEs: string; savedAt: string; note?: string
}

export default function EditorOverlay({ page }: { page: string }) {
  const [blocks, setBlocks] = useState<Record<string, Block>>({})
  const [activePop, setActivePop] = useState<{ key: string; rect: DOMRect } | null>(null)
  const [popEn, setPopEn] = useState('')
  const [popEs, setPopEs] = useState('')
  const [popLang, setPopLang] = useState<'en' | 'es'>('en')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [historyPanel, setHistoryPanel] = useState<{ block: Block; versions: Version[] } | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Load blocks for this page
  useEffect(() => {
    fetch(`/api/cms/blocks?page=${page}`)
      .then(r => r.json())
      .then(data => {
        if (data.blocks) {
          const map: Record<string, Block> = {}
          data.blocks.forEach((b: Block) => { map[b.key] = b })
          setBlocks(map)
        }
      })
      .catch(() => {})
  }, [page])

  // Add hover outlines to [data-cms-key] elements
  useEffect(() => {
    if (Object.keys(blocks).length === 0) return

    const elements = document.querySelectorAll('[data-cms-key]')
    const cleanups: (() => void)[] = []

    elements.forEach(el => {
      const key = el.getAttribute('data-cms-key')!
      const block = blocks[key]
      if (!block) return

      // Create edit pill
      const pill = document.createElement('button')
      pill.innerHTML = '✎ Edit'
      pill.style.cssText = `
        position:absolute; top:-10px; right:-2px; z-index:10000;
        background:#2d6a4f; color:white; border:none; border-radius:4px;
        padding:2px 8px; font-size:11px; font-weight:600; cursor:pointer;
        opacity:0; transition:opacity 0.15s; pointer-events:none; white-space:nowrap;
        font-family:sans-serif;
      `

      // Make element position relative if needed
      const htmlEl = el as HTMLElement
      const origPosition = htmlEl.style.position
      const origOutline = htmlEl.style.outline
      const origOutlineOffset = htmlEl.style.outlineOffset

      htmlEl.style.position = 'relative'
      htmlEl.appendChild(pill)

      const onMouseEnter = () => {
        htmlEl.style.outline = '2px dashed #40916c'
        htmlEl.style.outlineOffset = '4px'
        pill.style.opacity = '1'
        pill.style.pointerEvents = 'auto'
      }
      const onMouseLeave = (e: MouseEvent) => {
        if (!(e.relatedTarget instanceof Node) || !htmlEl.contains(e.relatedTarget as Node)) {
          htmlEl.style.outline = origOutline
          htmlEl.style.outlineOffset = origOutlineOffset
          pill.style.opacity = '0'
          pill.style.pointerEvents = 'none'
        }
      }
      const onPillClick = (e: MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        const rect = htmlEl.getBoundingClientRect()
        setActivePop({ key, rect })
        setPopEn(block.valueEn)
        setPopEs(block.valueEs)
        setPopLang('en')
        setSaveStatus('idle')
      }

      htmlEl.addEventListener('mouseenter', onMouseEnter)
      htmlEl.addEventListener('mouseleave', onMouseLeave)
      pill.addEventListener('click', onPillClick)

      cleanups.push(() => {
        htmlEl.removeEventListener('mouseenter', onMouseEnter)
        htmlEl.removeEventListener('mouseleave', onMouseLeave)
        pill.removeEventListener('click', onPillClick)
        htmlEl.style.position = origPosition
        htmlEl.style.outline = origOutline
        htmlEl.style.outlineOffset = origOutlineOffset
        if (pill.parentNode === htmlEl) htmlEl.removeChild(pill)
      })
    })

    return () => cleanups.forEach(fn => fn())
  }, [blocks])

  // Close popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActivePop(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const activeBlock = activePop ? blocks[activePop.key] : null

  const handleSave = async () => {
    if (!activeBlock) return
    setSaving(true)
    setSaveStatus('idle')
    try {
      const res = await fetch(`/api/cms/blocks/${activeBlock.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valueEn: popEn, valueEs: popEs }),
      })
      if (res.ok) {
        // Update local block cache
        setBlocks(prev => ({
          ...prev,
          [activeBlock.key]: { ...prev[activeBlock.key], valueEn: popEn, valueEs: popEs },
        }))
        // Update DOM element text
        const el = document.querySelector(`[data-cms-key="${activeBlock.key}"]`) as HTMLElement
        if (el) {
          // Update text nodes only (not the pill button)
          Array.from(el.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) node.textContent = popEn
          })
          el.style.outline = '2px solid #16a34a'
          setTimeout(() => { el.style.outline = '' }, 1200)
        }
        setSaveStatus('saved')
        setTimeout(() => { setActivePop(null); setSaveStatus('idle') }, 800)
      } else {
        setSaveStatus('error')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleLoadHistory = async () => {
    if (!activeBlock) return
    const res = await fetch(`/api/cms/blocks/${activeBlock.id}/history`)
    const data = await res.json()
    setHistoryPanel({ block: activeBlock, versions: data.versions ?? [] })
    setActivePop(null)
  }

  const handleRollback = async (versionId: string) => {
    if (!historyPanel) return
    const res = await fetch(`/api/cms/blocks/${historyPanel.block.id}/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ versionId }),
    })
    if (res.ok) {
      const data = await res.json()
      const b = data.block
      setBlocks(prev => ({ ...prev, [historyPanel.block.key]: { ...prev[historyPanel.block.key], valueEn: b.valueEn, valueEs: b.valueEs } }))
      const el = document.querySelector(`[data-cms-key="${historyPanel.block.key}"]`) as HTMLElement
      if (el) {
        Array.from(el.childNodes).forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) node.textContent = b.valueEn
        })
        el.style.outline = '2px solid #16a34a'
        setTimeout(() => { el.style.outline = '' }, 1200)
      }
      setHistoryPanel(null)
    }
  }

  // Compute popover position
  const popoverStyle = (): React.CSSProperties => {
    if (!activePop) return { display: 'none' }
    const { rect } = activePop
    const popW = 380, popH = 220
    const vw = window.innerWidth, vh = window.innerHeight + window.scrollY
    let top = rect.bottom + window.scrollY + 8
    let left = rect.left + window.scrollX
    if (top + popH > vh - 20) top = rect.top + window.scrollY - popH - 8
    if (left + popW > vw - 16) left = vw - popW - 16
    if (left < 8) left = 8
    return { position: 'absolute', top, left, width: popW, zIndex: 10001 }
  }

  if (Object.keys(blocks).length === 0) return null

  return (
    <>
      {/* Popover */}
      {activePop && activeBlock && (
        <div ref={popoverRef} style={popoverStyle()}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 font-sans">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">✎ {activeBlock.label}</span>
            <div className="flex gap-1">
              {(['en','es'] as const).map(lang => (
                <button key={lang} onClick={() => setPopLang(lang)}
                  className={`px-2 py-0.5 text-xs rounded font-semibold ${popLang === lang ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {activeBlock.type === 'richtext' ? (
            <textarea
              className="w-full border border-gray-200 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={4}
              value={popLang === 'en' ? popEn : popEs}
              onChange={e => popLang === 'en' ? setPopEn(e.target.value) : setPopEs(e.target.value)}
            />
          ) : (
            <input
              className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={popLang === 'en' ? popEn : popEs}
              onChange={e => popLang === 'en' ? setPopEn(e.target.value) : setPopEs(e.target.value)}
            />
          )}
          {saveStatus === 'saved' && <p className="text-xs text-green-600 mt-1">✓ Saved!</p>}
          {saveStatus === 'error' && <p className="text-xs text-red-500 mt-1">✗ Failed to save</p>}
          <div className="flex gap-2 mt-3">
            <button onClick={handleLoadHistory}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              ↩ History
            </button>
            <button onClick={() => setActivePop(null)}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 ml-auto">
              ✕ Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-1.5 text-xs bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
              {saving ? 'Saving…' : '✓ Save'}
            </button>
          </div>
        </div>
      )}

      {/* History drawer */}
      {historyPanel && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 340, zIndex: 10002, background: 'white', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-gray-800">↩ History — {historyPanel.block.label}</h3>
            <button onClick={() => setHistoryPanel(null)} className="text-gray-400 hover:text-gray-600 text-lg">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {historyPanel.versions.length === 0 && <p className="text-sm text-gray-400">No history yet.</p>}
            {historyPanel.versions.map(v => (
              <div key={v.id} className="border border-gray-100 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">{new Date(v.savedAt).toLocaleString()}</p>
                <p className="text-xs text-gray-700 line-clamp-2 mb-2">{v.valueEn || '(empty)'}</p>
                <button onClick={() => handleRollback(v.id)}
                  className="text-xs text-green-700 border border-green-200 rounded-lg px-3 py-1 hover:bg-green-50 font-medium">
                  Restore this version
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
