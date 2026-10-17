import { type Metadata } from 'next'

import { ProjectsPageContent } from '@/components/ProjectsPageContent'
import { getProjects } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Apps, games and experiments I have built while learning.',
}

export default async function Projects() {
  let apps = await getProjects()

  return <ProjectsPageContent apps={apps} />
}
