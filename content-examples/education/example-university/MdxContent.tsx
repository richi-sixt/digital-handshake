'use client'

import { useTranslation } from '@/i18n'
import { FallbackContent } from '@/components/FallbackContent'
import ContentEn from './page.en.mdx'
import ContentDe from './page.de.mdx'

export function MdxContent() {
  const { locale } = useTranslation()
  if (locale !== 'de') return <ContentEn />
  return <FallbackContent primary={<ContentDe />} fallback={<ContentEn />} />
}
