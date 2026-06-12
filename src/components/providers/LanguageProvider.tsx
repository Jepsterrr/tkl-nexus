'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { TRANSLATIONS, type Locale } from '@/lib/i18n';

type Translations = typeof TRANSLATIONS.sv | typeof TRANSLATIONS.en;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('sv');

  useEffect(() => {
    const stored = localStorage.getItem('tkl-locale') as Locale | null;
    if (stored && ['sv', 'en'].includes(stored)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('tkl-locale', l);
  }, []);

  // Memoiserat värde — annars omrenderas alla konsumenter vid varje render
  const value = useMemo(
    () => ({ locale, setLocale, t: TRANSLATIONS[locale] }),
    [locale, setLocale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
