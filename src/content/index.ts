import type { Locale } from '@/hooks/useLocale'

import { en } from './en'
import { es } from './es'
import type { SiteContent } from './types'

export type * from './types'

const CONTENT: Record<Locale, SiteContent> = { es, en }

export function getContent(locale: Locale): SiteContent {
  return CONTENT[locale]
}
