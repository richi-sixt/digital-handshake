import { type Metadata } from 'next'

import { ProjectsPageContent } from '@/components/ProjectsPageContent'
import { getAllApps } from '@/lib/apps'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Apps, games and experiments I have built while learning.',
}

export default async function Projects() {
  let apps = await getAllApps()

  return <ProjectsPageContent apps={apps} />
}
