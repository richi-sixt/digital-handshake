'use client'

import { AppList } from '@/components/AppList'
import { SimpleLayout } from '@/components/SimpleLayout'
import { useTranslation } from '@/i18n'
import { type ProjectSummary } from '@/lib/projects'

export function ProjectsPageContent({ apps }: { apps: ProjectSummary[] }) {
  let { t } = useTranslation()

  return (
    <SimpleLayout title={t('projects.title')} intro={t('projects.intro')}>
      <AppList apps={apps} />
    </SimpleLayout>
  )
}
