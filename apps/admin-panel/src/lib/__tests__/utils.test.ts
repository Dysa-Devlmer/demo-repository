import { cn } from '../utils';

describe('Utils - cn()', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const result = cn('base-class', true && 'conditional-class', false && 'hidden-class');
    expect(result).toContain('base-class');
    expect(result).toContain('conditional-class');
    expect(result).not.toContain('hidden-class');
  });

  it('should override conflicting Tailwind classes', () => {
    const result = cn('p-4', 'p-6');
    // twMerge should keep only the last padding class
    expect(result).toBe('p-6');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base', undefined, null, 'end');
    expect(result).toContain('base');
    expect(result).toContain('end');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toContain('class1');
    expect(result).toContain('class2');
    expect(result).toContain('class3');
  });

  it('should handle complex Tailwind class merging', () => {
    const result = cn('px-2 py-1 bg-red-500', 'p-4 bg-blue-500');
    // Should override padding and background
    expect(result).toBe('p-4 bg-blue-500');
  });
});
