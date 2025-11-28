'use client';

import { useState, useEffect } from 'react';
import { getDictionary, createTranslationFunction, type Locale, locales, defaultLocale } from '@/lib/i18n';

// Get current locale from various sources (client-side only)
function getCurrentLocale(): Locale {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  // 1. Check URL (for future locale-based routing)
  const pathname = window.location.pathname;
  const urlLocale = pathname.split('/')[1];
  if (locales.includes(urlLocale as Locale)) {
    return urlLocale as Locale;
  }

  // 2. Check cookie
  const cookieLocale = document.cookie
    .split('; ')
    .find(row => row.startsWith('NEXT_LOCALE='))
    ?.split('=')[1];

  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // 3. Check browser language
  const browserLocale = navigator.language.substring(0, 2);
  if (locales.includes(browserLocale as Locale)) {
    return browserLocale as Locale;
  }

  return defaultLocale;
}

// Set locale in cookie (client-side only)
function setLocaleCookie(locale: Locale) {
  if (typeof document !== 'undefined') {
    document.cookie = `NEXT_LOCALE=${locale}; max-age=31536000; path=/`;
  }
}

export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [dictionary, setDictionary] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [t, setT] = useState<(key: string, params?: Record<string, any> | string) => string>(() => (key: string) => key);

  useEffect(() => {
    const currentLocale = getCurrentLocale();
    setLocaleState(currentLocale);
    setLocaleCookie(currentLocale);

    const loadDictionary = async () => {
      try {
        const dict = await getDictionary(currentLocale);
        setDictionary(dict);
        // Use requestAnimationFrame to batch state updates and avoid FOUC
        requestAnimationFrame(() => {
          setT(() => createTranslationFunction(dict));
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Failed to load translations:', error);
        setT(() => (key: string) => key);
        setIsLoading(false);
      }
    };

    loadDictionary();
  }, []);

  const changeLocale = async (newLocale: Locale) => {
    setIsLoading(true);
    try {
      const dict = await getDictionary(newLocale);
      setDictionary(dict);
      setT(() => createTranslationFunction(dict));
      setLocaleState(newLocale);
      setLocaleCookie(newLocale);
      
      // Force page refresh to update the UI completely
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('Failed to change locale:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    t,
    locale,
    changeLocale,
    isLoading
  };
}