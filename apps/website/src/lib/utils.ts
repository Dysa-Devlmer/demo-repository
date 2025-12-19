import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  price: number | string,
  options: {
    currency?: 'USD' | 'CLP' | 'EUR'
    notation?: Intl.NumberFormatOptions['notation']
  } = {}
) {
  const { currency = 'CLP', notation = 'standard' } = options

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price

  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    notation,
    maximumFractionDigits: 0,
  }).format(numericPrice)
}

export function formatNumber(number: number) {
  return new Intl.NumberFormat('es-CL').format(number)
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateSubdomain(name: string) {
  return slugify(name)
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 20)
}

export function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePhone(phone: string) {
  // Chilean phone format: +56 9 XXXX XXXX
  const re = /^(\+?56|0)?(\s)?9\s?[0-9]{8}$/
  return re.test(phone.replace(/\s/g, ''))
}

export function formatPhoneChile(phone: string) {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('569')) {
    return `+56 9 ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`
  }
  if (cleaned.startsWith('9') && cleaned.length === 9) {
    return `+56 9 ${cleaned.slice(1, 5)} ${cleaned.slice(5)}`
  }
  return phone
}

export function generateApiKey(length: number = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
