'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dictionary, Locale, TranslationKey } from './dictionary';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  formatNumber: (n: number | string | null | undefined) => string;
  getText: (enText?: string | null, bnText?: string | null) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const LOCALE_KEY = 'shondhan_locale';

const banglaDigits: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('bn'); // Default to Bangla as per blueprint

  useEffect(() => {
    const saved = localStorage.getItem(LOCALE_KEY) as Locale | null;
    if (saved === 'bn' || saved === 'en') {
      setLocaleState(saved);
    }
  }, []);

  // Keep <html lang> in sync so Bangla fonts and line-height apply.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_KEY, newLocale);
    // Also set html lang attribute
    document.documentElement.lang = newLocale;
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = dictionary[locale] || dictionary.bn;
    const str = dict[key];
    if (str) return str;
    return fallback || dictionary.en[key] || String(key);
  };

  const formatNumber = (n: number | string | null | undefined): string => {
    if (n === null || n === undefined) return '';
    const numStr = String(n);
    if (locale !== 'bn') return numStr;
    return numStr.replace(/[0-9]/g, (match) => banglaDigits[match] || match);
  };

  const getText = (enText?: string | null, bnText?: string | null): string => {
    if (locale === 'bn') {
      return bnText || enText || '';
    }
    return enText || bnText || '';
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, formatNumber, getText }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
