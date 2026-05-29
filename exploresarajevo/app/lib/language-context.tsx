"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import translations
import bsTranslations from './translations/bs.json';
import enTranslations from './translations/en.json';

// Types
export type Language = 'bs' | 'en';

type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = { [key: string]: TranslationValue };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Translations> = {
  bs: bsTranslations as Translations,
  en: enTranslations as Translations,
};

// Helper function to get nested translation value
const getNestedValue = (obj: Translations, path: string): string => {
  const keys = path.split('.');
  let current: TranslationValue = obj;
  
  for (const key of keys) {
    if (typeof current === 'object' && current !== null && key in current) {
      current = current[key];
    } else {
      return path; // Return path if key not found
    }
  }
  
  return typeof current === 'string' ? current : path;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  // Default to Bosnian
  const [language, setLanguageState] = useState<Language>('bs');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('explore-sarajevo-language') as Language | null;
    if (savedLanguage && (savedLanguage === 'bs' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('en')) {
        setLanguageState('en');
      } else {
        // Default to Bosnian for all other languages
        setLanguageState('bs');
      }
    }
    setIsInitialized(true);
  }, []);

  // Save language to localStorage when it changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('explore-sarajevo-language', lang);
  };

  // Translation function
  const t = (key: string): string => {
    return getNestedValue(translations[language], key);
  };

  // Return null during SSR to avoid hydration mismatch, then render with actual language
  if (!isInitialized) {
    return (
      <LanguageContext.Provider value={{ language: 'bs', setLanguage, t: (key) => getNestedValue(translations['bs'], key) }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Alias for convenience - useTranslation returns the same context
export const useTranslation = useLanguage;

/**
 * Hook to get localized content from CMS data
 * Takes a base object and returns the appropriate field based on current language
 * 
 * Example usage:
 * const localizedCategory = useLocalizedContent(category);
 * // Returns { name: category.name_en || category.name, description: category.description_en || category.description, ... }
 */
export function useLocalizedContent<T extends object>(
  item: T | null | undefined
): T | null {
  const { language } = useLanguage();
  
  if (!item) return null;
  
  if (language === 'bs') {
    // Return original item for Bosnian
    return item;
  }
  
  // For English, try to get _en suffixed fields
  const localizedItem = { ...item } as Record<string, unknown>;
  const itemRecord = item as Record<string, unknown>;
  
  const fieldsToLocalize = [
    'name', 'title', 'description', 'short_description', 'long_description',
    'content', 'address', 'tagline', 'price_info', 'price_range', 'opening_hours'
  ];
  
  for (const field of fieldsToLocalize) {
    const enField = `${field}_en`;
    if (enField in itemRecord && itemRecord[enField]) {
      localizedItem[field] = itemRecord[enField];
    }
  }
  
  return localizedItem as T;
}

/**
 * Helper function to get localized field from an object
 * Use this for one-off field access without the full hook
 */
export function getLocalizedField<T>(
  item: Record<string, unknown> | null | undefined,
  field: string,
  language: Language
): T | null {
  if (!item) return null;
  
  if (language === 'en') {
    const enField = `${field}_en`;
    if (enField in item && item[enField]) {
      return item[enField] as T;
    }
  }
  
  return (item[field] as T) || null;
}
