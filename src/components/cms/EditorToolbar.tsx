'use client'
import { useRouter } from 'next/navigation'

export default function EditorToolbar({ pageName }: { pageName: string }) {
  const router = useRouter()

  const exitEditor = async () => {
    await fetch('/api/cms/editor/disable', { method: 'POST' })
    router.refresh()
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: '#1b3a2d', color: 'white', height: '48px',
      display: 'flex', alignItems: 'center', padding: '0 1.5rem', gap: '1rem',
      boxShadow: '0 2px 12px rgba(0,0,0,0.3)', fontFamily: 'sans-serif',
    }}>
      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>✏️ Editor Mode</span>
      <span style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 10px', borderRadius: '4px', fontSize: '0.75rem' }}>
        {pageName}
      </span>
      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
        Hover over any text to edit it
      </span>
      <button onClick={exitEditor} style={{
        marginLeft: 'auto', background: '#dc2626', color: 'white', border: 'none',
        padding: '6px 14px', borderRadius: '6px', cursor: 'pointer',
        fontSize: '0.8rem', fontWeight: 600,
      }}>
        Exit Editor
      </button>
    </div>
  )
}
