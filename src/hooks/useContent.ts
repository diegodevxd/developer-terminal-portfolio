import { getContent } from '@/content'
import type { SiteContent } from '@/content/types'
import { useLocale } from '@/hooks/useLocale'

export function useContent(): SiteContent {
  const { locale } = useLocale()
  return getContent(locale)
}
