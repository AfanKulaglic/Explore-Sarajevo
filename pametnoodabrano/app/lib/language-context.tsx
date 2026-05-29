"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import bsTranslations from "./translations/bs.json";
import enTranslations from "./translations/en.json";

export type Language = "bs" | "en";

type TranslationValue = string | string[] | { [key: string]: TranslationValue };
type Translations = typeof bsTranslations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  tArray: (key: string) => string[];
  translations: Translations;
}

const translations: Record<Language, Translations> = {
  bs: bsTranslations,
  en: enTranslations,
};

const LanguageContext = createContext<LanguageContextType>({
  language: "bs",
  setLanguage: () => {},
  t: (key: string) => key,
  tArray: () => [],
  translations: bsTranslations,
});

const STORAGE_KEY = "saraya_pametno_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("bs");
  const [mounted, setMounted] = useState(false);

  // Load saved language preference on mount
  useEffect(() => {
    setMounted(true);
    const savedLanguage = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (savedLanguage && (savedLanguage === "bs" || savedLanguage === "en")) {
      setLanguageState(savedLanguage);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "en") {
        setLanguageState("en");
      }
    }
  }, []);

  // Update HTML lang attribute when language changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  // Translation function with dot notation support
  const t = useCallback(
    (key: string): string => {
      const keys = key.split(".");
      let value: TranslationValue = translations[language];

      for (const k of keys) {
        if (value && typeof value === "object" && !Array.isArray(value) && k in value) {
          value = value[k as keyof typeof value];
        } else {
          console.warn(`Translation key not found: ${key}`);
          return key;
        }
      }

      if (typeof value === "string") {
        return value;
      }

      console.warn(`Translation key is not a string: ${key}`);
      return key;
    },
    [language]
  );

  // Translation function for array values
  const tArray = useCallback(
    (key: string): string[] => {
      const keys = key.split(".");
      let value: TranslationValue = translations[language];

      for (const k of keys) {
        if (value && typeof value === "object" && !Array.isArray(value) && k in value) {
          value = value[k as keyof typeof value];
        } else {
          console.warn(`Translation key not found: ${key}`);
          return [];
        }
      }

      if (Array.isArray(value)) {
        return value;
      }

      console.warn(`Translation key is not an array: ${key}`);
      return [];
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        tArray,
        translations: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Hook to get the current translations object directly
export function useTranslations() {
  const { translations } = useLanguage();
  return translations;
}

// Helper hook to get localized CMS content
// For a field like "title", it will return title_en if language is 'en' and title_en exists,
// otherwise falls back to the original field (Bosnian)
export function useLocalizedContent() {
  const { language } = useLanguage();
  
  const getLocalizedField = useCallback(<T extends object>(
    item: T,
    field: string
  ): string => {
    if (language === 'en') {
      const enField = `${field}_en`;
      const enValue = (item as Record<string, unknown>)[enField];
      if (enValue && typeof enValue === 'string' && enValue.trim() !== '') {
        return enValue;
      }
    }
    // Fallback to original field (Bosnian)
    const value = (item as Record<string, unknown>)[field];
    return typeof value === 'string' ? value : '';
  }, [language]);
  
  const getLocalizedArray = useCallback(<T extends object>(
    item: T,
    field: string
  ): string[] => {
    if (language === 'en') {
      const enField = `${field}_en`;
      const enValue = (item as Record<string, unknown>)[enField];
      if (Array.isArray(enValue) && enValue.length > 0) {
        return enValue as string[];
      }
    }
    // Fallback to original field (Bosnian)
    const value = (item as Record<string, unknown>)[field];
    return Array.isArray(value) ? value as string[] : [];
  }, [language]);
  
  return { getLocalizedField, getLocalizedArray, language };
}
