'use client'

import { SimpleLayout } from '@/components/SimpleLayout'
import { ProjectList } from '@/components/ProjectList'
import { useTranslation } from '@/i18n'
import { type ProjectWithSlug } from '@/lib/projects'

export function ProjectsPageContent({
  projects,
}: {
  projects: ProjectWithSlug[]
}) {
  let { t } = useTranslation()

  return (
    <SimpleLayout title={t('projects.title')} intro={t('projects.intro')}>
      <ProjectList projects={projects} />
    </SimpleLayout>
  )
}
