export type Locale = 'es' | 'en' | 'fr';

export const locales: Locale[] = ['es', 'en', 'fr'];
export const defaultLocale: Locale = 'es';

export const languages = {
  es: { name: 'Español', flag: '🇪🇸' },
  en: { name: 'English', flag: '🇺🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
};

// Dictionary type
interface Dictionary {
  [key: string]: any;
}

// Translation dictionaries cache
const dictionaries: { [key in Locale]?: Dictionary } = {};

// Load dictionary for a specific locale
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  if (dictionaries[locale]) {
    return dictionaries[locale]!;
  }

  try {
    const response = await import(`../../public/locales/${locale}/common.json`);
    dictionaries[locale] = response.default;
    return dictionaries[locale]!;
  } catch (error) {
    console.warn(`Failed to load dictionary for locale: ${locale}`);
    // Fallback to default locale
    if (locale !== defaultLocale) {
      return getDictionary(defaultLocale);
    }
    return {};
  }
}

// Utility function to get nested object property by path
export function getNestedTranslation(obj: Dictionary, path: string): string {
  const result = path.split('.').reduce((current: any, key) => {
    return current && current[key] !== undefined ? current[key] : path;
  }, obj as any);
  return typeof result === 'string' ? result : path;
}

// Translation function with interpolation support
export function createTranslationFunction(dictionary: Dictionary) {
  return function t(key: string, params?: Record<string, any> | string): string {
    const translation = getNestedTranslation(dictionary, key);

    // If params is a string, it's the fallback (backward compatibility)
    if (typeof params === 'string') {
      return typeof translation === 'string' ? translation : params || key;
    }

    // If no translation found, return key
    if (typeof translation !== 'string') {
      return key;
    }

    // If no params, return translation as-is
    if (!params) {
      return translation;
    }

    // Replace all {variableName} placeholders with actual values
    return translation.replace(/\{(\w+)\}/g, (match, variableName) => {
      return params[variableName] !== undefined ? String(params[variableName]) : match;
    });
  };
}