import { LazyMotion, MotionConfig } from 'motion/react'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  LocaleContext,
  readStoredLocale,
  writeStoredLocale,
  type Locale,
  type LocaleContextValue,
} from '@/hooks/useLocale'

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale)

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    writeStoredLocale(next)
  }, [])

  const value = useMemo<LocaleContextValue>(() => ({ locale, setLocale }), [locale, setLocale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

const loadMotionFeatures = () => import('./motionFeatures').then((mod) => mod.default)

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadMotionFeatures} strict>
        <LocaleProvider>{children}</LocaleProvider>
      </LazyMotion>
    </MotionConfig>
  )
}
