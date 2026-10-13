'use client'

import { AppList } from '@/components/AppList'
import { SimpleLayout } from '@/components/SimpleLayout'
import { useTranslation } from '@/i18n'
import { type AppWithSlug } from '@/lib/apps'

export function ProjectsPageContent({ apps }: { apps: AppWithSlug[] }) {
  let { t } = useTranslation()

  return (
    <SimpleLayout title={t('projects.title')} intro={t('projects.intro')}>
      <AppList apps={apps} />
    </SimpleLayout>
  )
}
