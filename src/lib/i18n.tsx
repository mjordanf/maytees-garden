'use client'
import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import en from '../../messages/en.json'
import es from '../../messages/es.json'

type Lang = 'en' | 'es'
type Messages = typeof en

const messages: Record<Lang, Messages> = { en, es }

interface I18nContextType {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang
    if (saved === 'en' || saved === 'es') setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  const t = (key: string): string => {
    const parts = key.split('.')
    let val: any = messages[lang]
    for (const p of parts) {
      val = val?.[p]
      if (val === undefined) return key
    }
    return typeof val === 'string' ? val : key
  }

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
