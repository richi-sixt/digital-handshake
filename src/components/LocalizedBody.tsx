'use client'

import { type ReactNode } from 'react'

import { useTranslation } from '@/i18n'

/**
 * Picks the pre-rendered German or English post body by locale. Falls back to
 * English when there is no German text.
 */
export function LocalizedBody({
  en,
  de,
}: {
  en: ReactNode
  de?: ReactNode | null
}) {
  let { locale } = useTranslation()
  return <>{locale === 'de' && de ? de : en}</>
}
