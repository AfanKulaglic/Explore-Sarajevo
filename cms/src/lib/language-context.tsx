'use client';

import * as React from 'react';
import { LanguageCode, LANGUAGES, t as translate } from '@/lib/config/i18n';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  languages: typeof LANGUAGES;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'cms_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<LanguageCode>('bs');
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Load language from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    if (stored && (stored === 'bs' || stored === 'en')) {
      setLanguageState(stored);
    }
    setIsHydrated(true);
  }, []);

  const setLanguage = React.useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = React.useCallback((key: string) => {
    return translate(key, language);
  }, [language]);

  // Prevent hydration mismatch by not rendering until client-side
  if (!isHydrated) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for components that might not have context (e.g., during SSR)
export function useLanguageSafe() {
  const context = React.useContext(LanguageContext);
  return context || { 
    language: 'bs' as LanguageCode, 
    setLanguage: () => {}, 
    t: (key: string) => translate(key, 'bs'),
    languages: LANGUAGES 
  };
}
