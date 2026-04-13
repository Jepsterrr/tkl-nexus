'use client';

import { useEffect } from 'react';
import { useLanguage } from './LanguageProvider';

export function HtmlLangSync() {
  const { locale } = useLanguage();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
