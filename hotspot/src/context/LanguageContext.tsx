'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Language } from '@/types/content'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (bosnian: string, english: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('EN')

  const t = (bosnian: string, english: string) => {
    return language === 'BA' ? bosnian : english
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
