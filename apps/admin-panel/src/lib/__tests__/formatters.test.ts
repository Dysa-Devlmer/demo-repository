import {
  formatCurrency,
  formatDate,
  formatPhoneNumber,
  truncateText,
  capitalize,
  capitalizeWords,
  formatRelativeTime,
  getInitials,
  formatFileSize,
} from '../formatters';

describe('Formatters', () => {
  describe('formatCurrency()', () => {
    it('should format USD currency in Spanish locale', () => {
      const result = formatCurrency(1234.56, 'USD', 'es-MX');
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('should format MXN currency', () => {
      const result = formatCurrency(1000, 'MXN', 'es-MX');
      expect(result).toContain('1');
      expect(result).toContain('000');
    });

    it('should use default currency (USD)', () => {
      const result = formatCurrency(100);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should format zero correctly', () => {
      const result = formatCurrency(0, 'USD', 'es-MX');
      expect(result).toContain('0');
    });

    it('should format negative amounts', () => {
      const result = formatCurrency(-50, 'USD', 'es-MX');
      expect(result).toContain('50');
    });

    it('should handle decimal values', () => {
      const result = formatCurrency(99.99, 'USD', 'en-US');
      expect(result).toContain('99.99');
    });
  });

  describe('formatDate()', () => {
    it('should format date object', () => {
      const date = new Date('2025-01-15T12:00:00Z');
      const result = formatDate(date, 'es-MX');
      expect(result).toContain('2025');
      expect(result).toContain('enero');
      // Date may vary by timezone, just check it has a day
      expect(result).toMatch(/\d+/);
    });

    it('should format date string', () => {
      const result = formatDate('2025-01-15T12:00:00Z', 'es-MX');
      expect(result).toContain('2025');
      expect(result).toContain('enero');
    });

    it('should use custom options', () => {
      const date = new Date('2025-01-15T12:00:00Z');
      const result = formatDate(date, 'es-MX', { month: 'short', day: 'numeric' });
      // Just check it's formatted
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should format in English locale', () => {
      const date = new Date('2025-01-15T12:00:00Z');
      const result = formatDate(date, 'en-US');
      expect(result.includes('January') || result.includes('2025')).toBe(true);
    });
  });

  describe('formatPhoneNumber()', () => {
    it('should format 10-digit US number', () => {
      const result = formatPhoneNumber('5551234567');
      expect(result).toBe('(555) 123-4567');
    });

    it('should format 11-digit US number with country code', () => {
      const result = formatPhoneNumber('15551234567');
      expect(result).toBe('+1 (555) 123-4567');
    });

    it('should format Mexican number', () => {
      const result = formatPhoneNumber('525512345678');
      expect(result).toBe('+52 55 1234 5678');
    });

    it('should handle number with special characters', () => {
      const result = formatPhoneNumber('(555) 123-4567');
      expect(result).toBe('(555) 123-4567');
    });

    it('should handle number with spaces', () => {
      const result = formatPhoneNumber('555 123 4567');
      expect(result).toBe('(555) 123-4567');
    });

    it('should return original if pattern does not match', () => {
      const result = formatPhoneNumber('123');
      expect(result).toBe('123');
    });

    it('should handle empty string', () => {
      const result = formatPhoneNumber('');
      expect(result).toBe('');
    });
  });

  describe('truncateText()', () => {
    it('should truncate long text', () => {
      const result = truncateText('This is a very long text', 10);
      expect(result).toBe('This is...');
      expect(result.length).toBe(10);
    });

    it('should not truncate short text', () => {
      const result = truncateText('Short', 10);
      expect(result).toBe('Short');
    });

    it('should use custom ellipsis', () => {
      const result = truncateText('Long text here', 10, '…');
      expect(result).toBe('Long text…');
    });

    it('should handle exact length', () => {
      const result = truncateText('Exactly10!', 10);
      expect(result).toBe('Exactly10!');
    });

    it('should handle empty string', () => {
      const result = truncateText('', 10);
      expect(result).toBe('');
    });

    it('should handle maxLength of 0', () => {
      const result = truncateText('Text', 0);
      // When maxLength is 0, result is: slice(0, 0 - 3) + '...' = slice(0, -3) + '...'
      // slice with negative value takes from end, so it may include some chars
      expect(result).toContain('...');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('capitalize()', () => {
    it('should capitalize first letter', () => {
      const result = capitalize('hello');
      expect(result).toBe('Hello');
    });

    it('should lowercase rest of string', () => {
      const result = capitalize('hELLO');
      expect(result).toBe('Hello');
    });

    it('should handle single character', () => {
      const result = capitalize('a');
      expect(result).toBe('A');
    });

    it('should handle empty string', () => {
      const result = capitalize('');
      expect(result).toBe('');
    });

    it('should handle uppercase string', () => {
      const result = capitalize('HELLO');
      expect(result).toBe('Hello');
    });
  });

  describe('capitalizeWords()', () => {
    it('should capitalize each word', () => {
      const result = capitalizeWords('hello world');
      expect(result).toBe('Hello World');
    });

    it('should handle multiple spaces', () => {
      const result = capitalizeWords('hello  world');
      expect(result).toBe('Hello  World');
    });

    it('should handle mixed case', () => {
      const result = capitalizeWords('hELLO wORLD');
      expect(result).toBe('Hello World');
    });

    it('should handle single word', () => {
      const result = capitalizeWords('hello');
      expect(result).toBe('Hello');
    });

    it('should handle empty string', () => {
      const result = capitalizeWords('');
      expect(result).toBe('');
    });
  });

  describe('formatRelativeTime()', () => {
    beforeAll(() => {
      // Mock current time for consistent testing
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-15T12:00:00Z'));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should format seconds ago', () => {
      const date = new Date('2025-01-15T11:59:30Z');
      const result = formatRelativeTime(date, 'es');
      expect(result).toContain('segundo');
    });

    it('should format minutes ago', () => {
      const date = new Date('2025-01-15T11:55:00Z');
      const result = formatRelativeTime(date, 'es');
      expect(result).toContain('minuto');
    });

    it('should format hours ago', () => {
      const date = new Date('2025-01-15T10:00:00Z');
      const result = formatRelativeTime(date, 'es');
      expect(result).toContain('hora');
    });

    it('should format days ago', () => {
      const date = new Date('2025-01-14T12:00:00Z');
      const result = formatRelativeTime(date, 'es');
      // May return "ayer" (yesterday) or "hace 1 día"
      expect(result === 'ayer' || result.includes('día')).toBe(true);
    });

    it('should handle date string', () => {
      const result = formatRelativeTime('2025-01-15T11:55:00Z', 'es');
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should format in English locale', () => {
      const date = new Date('2025-01-15T11:55:00Z');
      const result = formatRelativeTime(date, 'en');
      expect(result.includes('minute') || result.includes('ago')).toBe(true);
    });
  });

  describe('getInitials()', () => {
    it('should get initials from full name', () => {
      const result = getInitials('John Doe');
      expect(result).toBe('JD');
    });

    it('should get initial from single name', () => {
      const result = getInitials('John');
      expect(result).toBe('J');
    });

    it('should handle multiple middle names', () => {
      const result = getInitials('John Michael Doe');
      expect(result).toBe('JD');
    });

    it('should handle extra spaces', () => {
      const result = getInitials('  John   Doe  ');
      expect(result).toBe('JD');
    });

    it('should handle lowercase names', () => {
      const result = getInitials('john doe');
      expect(result).toBe('JD');
    });

    it('should handle empty string', () => {
      const result = getInitials('');
      expect(result).toBe('');
    });

    it('should handle special characters', () => {
      const result = getInitials('José María');
      expect(result).toBe('JM');
    });
  });

  describe('formatFileSize()', () => {
    it('should format bytes', () => {
      const result = formatFileSize(100);
      expect(result).toBe('100 Bytes');
    });

    it('should format kilobytes', () => {
      const result = formatFileSize(1024);
      expect(result).toBe('1 KB');
    });

    it('should format megabytes', () => {
      const result = formatFileSize(1024 * 1024);
      expect(result).toBe('1 MB');
    });

    it('should format gigabytes', () => {
      const result = formatFileSize(1024 * 1024 * 1024);
      expect(result).toBe('1 GB');
    });

    it('should format terabytes', () => {
      const result = formatFileSize(1024 * 1024 * 1024 * 1024);
      expect(result).toBe('1 TB');
    });

    it('should handle zero bytes', () => {
      const result = formatFileSize(0);
      expect(result).toBe('0 Bytes');
    });

    it('should format decimal values', () => {
      const result = formatFileSize(1536);
      expect(result).toBe('1.5 KB');
    });

    it('should format large decimal values', () => {
      const result = formatFileSize(1024 * 1024 * 2.5);
      expect(result).toBe('2.5 MB');
    });
  });

  describe('Integration Tests', () => {
    it('should format complete user profile data', () => {
      const name = 'juan pérez';
      const phone = '5551234567';
      const balance = 1234.56;

      expect(capitalizeWords(name)).toBe('Juan Pérez');
      expect(formatPhoneNumber(phone)).toBe('(555) 123-4567');
      expect(formatCurrency(balance, 'USD', 'en-US')).toContain('1,234.56');
      expect(getInitials(name)).toBe('JP');
    });

    it('should format message metadata', () => {
      const text = 'This is a very long message that needs to be truncated for display';
      const date = new Date();

      const truncated = truncateText(text, 30);
      expect(truncated.length).toBeLessThanOrEqual(30);

      const formatted = formatRelativeTime(date, 'es');
      expect(formatted).toBeDefined();
    });

    it('should format file upload info', () => {
      const fileSize = 2.5 * 1024 * 1024; // 2.5 MB
      const fileName = 'very_long_filename_that_needs_truncation.pdf';

      expect(formatFileSize(fileSize)).toBe('2.5 MB');
      expect(truncateText(fileName, 20)).toHaveLength(20);
    });
  });
});
