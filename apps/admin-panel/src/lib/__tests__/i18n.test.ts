import {
  Locale,
  locales,
  defaultLocale,
  languages,
  getDictionary,
  getNestedTranslation,
  createTranslationFunction,
} from '../i18n';

describe('i18n - Internationalization', () => {
  describe('Constants', () => {
    it('should have correct supported locales', () => {
      expect(locales).toEqual(['es', 'en', 'fr']);
    });

    it('should have Spanish as default locale', () => {
      expect(defaultLocale).toBe('es');
    });

    it('should have language metadata', () => {
      expect(languages.es).toEqual({ name: 'Español', flag: '🇪🇸' });
      expect(languages.en).toEqual({ name: 'English', flag: '🇺🇸' });
      expect(languages.fr).toEqual({ name: 'Français', flag: '🇫🇷' });
    });

    it('should have all locales in languages object', () => {
      locales.forEach((locale) => {
        expect(languages[locale]).toBeDefined();
        expect(languages[locale].name).toBeDefined();
        expect(languages[locale].flag).toBeDefined();
      });
    });
  });

  describe('getNestedTranslation()', () => {
    const testDictionary = {
      hello: 'Hola',
      common: {
        welcome: 'Bienvenido',
        goodbye: 'Adiós',
      },
      deep: {
        nested: {
          value: 'Valor profundo',
        },
      },
    };

    it('should get top-level translation', () => {
      const result = getNestedTranslation(testDictionary, 'hello');
      expect(result).toBe('Hola');
    });

    it('should get nested translation with dot notation', () => {
      const result = getNestedTranslation(testDictionary, 'common.welcome');
      expect(result).toBe('Bienvenido');
    });

    it('should get deeply nested translation', () => {
      const result = getNestedTranslation(testDictionary, 'deep.nested.value');
      expect(result).toBe('Valor profundo');
    });

    it('should return key if translation not found', () => {
      const result = getNestedTranslation(testDictionary, 'nonexistent.key');
      expect(result).toBe('nonexistent.key');
    });

    it('should handle empty dictionary', () => {
      const result = getNestedTranslation({}, 'any.key');
      expect(result).toBe('any.key');
    });

    it('should handle undefined values in path', () => {
      const result = getNestedTranslation(testDictionary, 'common.nonexistent');
      expect(result).toBe('common.nonexistent');
    });
  });

  describe('createTranslationFunction()', () => {
    const testDictionary = {
      welcome: 'Bienvenido',
      greeting: 'Hola {name}',
      message: 'Tienes {count} mensajes nuevos',
      complex: 'Usuario {user} tiene {points} puntos en {game}',
      common: {
        save: 'Guardar',
        cancel: 'Cancelar',
      },
    };

    const t = createTranslationFunction(testDictionary);

    describe('Basic Translation', () => {
      it('should translate simple key', () => {
        expect(t('welcome')).toBe('Bienvenido');
      });

      it('should translate nested key', () => {
        expect(t('common.save')).toBe('Guardar');
      });

      it('should return key if translation not found', () => {
        expect(t('nonexistent.key')).toBe('nonexistent.key');
      });

      it('should handle empty key', () => {
        expect(t('')).toBe('');
      });
    });

    describe('Interpolation', () => {
      it('should interpolate single variable', () => {
        const result = t('greeting', { name: 'Carlos' });
        expect(result).toBe('Hola Carlos');
      });

      it('should interpolate multiple variables', () => {
        const result = t('message', { count: 5 });
        expect(result).toBe('Tienes 5 mensajes nuevos');
      });

      it('should interpolate complex template', () => {
        const result = t('complex', { user: 'Juan', points: 100, game: 'Chess' });
        expect(result).toBe('Usuario Juan tiene 100 puntos en Chess');
      });

      it('should handle missing interpolation params', () => {
        const result = t('greeting', {});
        expect(result).toBe('Hola {name}');
      });

      it('should handle partial interpolation params', () => {
        const result = t('complex', { user: 'María', points: 50 });
        expect(result).toBe('Usuario María tiene 50 puntos en {game}');
      });

      it('should convert numbers to strings in interpolation', () => {
        const result = t('message', { count: 0 });
        expect(result).toBe('Tienes 0 mensajes nuevos');
      });
    });

    describe('Backward Compatibility', () => {
      it('should return key when translation not found (string param as fallback)', () => {
        // getNestedTranslation returns the key when not found, so translation will be 'nonexistent' (a string)
        // Line 54: return typeof translation === 'string' ? translation : params || key
        // Since translation is a string (the key), it returns translation (the key)
        const result = t('nonexistent', 'Fallback text');
        expect(result).toBe('nonexistent');
      });

      it('should return translation when it exists, even with string fallback', () => {
        const result = t('welcome', 'Fallback');
        expect(result).toBe('Bienvenido');
      });
    });

    describe('Edge Cases', () => {
      it('should handle undefined params', () => {
        const result = t('greeting', undefined);
        expect(result).toBe('Hola {name}');
      });

      it('should handle null params', () => {
        const result = t('greeting', null as any);
        expect(result).toBe('Hola {name}');
      });

      it('should handle empty string params', () => {
        const result = t('greeting', { name: '' });
        expect(result).toBe('Hola ');
      });

      it('should handle special characters in interpolation', () => {
        const specialDict = { test: 'Value: {value}' };
        const specialT = createTranslationFunction(specialDict);
        const result = specialT('test', { value: '<>&"\'{}' });
        expect(result).toBe('Value: <>&"\'{}');
      });
    });
  });

  describe('Type Safety', () => {
    it('should accept valid locales', () => {
      const validLocales: Locale[] = ['es', 'en', 'fr'];
      expect(validLocales).toHaveLength(3);
    });

    it('should have consistent locale types', () => {
      expect(typeof defaultLocale).toBe('string');
      expect(locales).toContain(defaultLocale);
    });
  });
});
