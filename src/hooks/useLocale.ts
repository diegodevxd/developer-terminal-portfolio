import { createContext, useContext } from 'react'

export type Locale = 'es' | 'en'

export interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const LOCALE_STORAGE_KEY = 'dm-locale'
export const DEFAULT_LOCALE: Locale = 'es'

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function isLocale(value: unknown): value is Locale {
  return value === 'es' || value === 'en'
}

export function readStoredLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return isLocale(stored) ? stored : DEFAULT_LOCALE
  } catch {
    return DEFAULT_LOCALE
  }
}

export function writeStoredLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // Storage unavailable (private mode, blocked cookies): keep the locale in memory only.
  }
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error('useLocale must be used inside <LocaleProvider>')
  }
  return context
}
