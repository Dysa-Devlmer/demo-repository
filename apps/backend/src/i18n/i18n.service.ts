import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

interface Translations {
  [key: string]: any;
}

@Injectable()
export class I18nService {
  private translations: Map<string, Translations> = new Map();
  private currentLanguage = 'es'; // Default language

  constructor() {
    this.loadTranslations();
  }

  private loadTranslations() {
    const languages = ['es', 'en', 'fr'];

    for (const lang of languages) {
      try {
        const translationPath = join(__dirname, lang, 'main.json');
        const content = readFileSync(translationPath, 'utf8');
        this.translations.set(lang, JSON.parse(content));
        console.log(`✅ Enterprise++++ i18n loaded for ${lang.toUpperCase()}`);
      } catch (error) {
        console.error(`🚨 CRITICAL: Failed to load Enterprise++++ translations for ${lang}:`, error.message);
      }
    }
  }

  setLanguage(lang: string) {
    if (this.translations.has(lang)) {
      this.currentLanguage = lang;
    }
  }

  getLanguage(): string {
    return this.currentLanguage;
  }

  translate(key: string, params?: Record<string, any>, lang?: string): string {
    const language = lang || this.currentLanguage;
    const translations = this.translations.get(language) || this.translations.get('es');

    if (!translations) {
      return key; // Fallback to key if no translations available
    }

    // Navigate through nested keys (e.g., 'errors.customerNameRequired')
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Fallback to key if path not found
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters in the translation string
    if (params) {
      return (value as string).replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? String(params[paramKey]) : match;
      });
    }

    return value as string;
  }

  // Shorthand method for easier use
  t(key: string, params?: Record<string, any>, lang?: string): string {
    return this.translate(key, params, lang);
  }

  // Get all available languages
  getAvailableLanguages(): string[] {
    return Array.from(this.translations.keys());
  }

  // Check if a language is supported
  isLanguageSupported(lang: string): boolean {
    return this.translations.has(lang);
  }
}