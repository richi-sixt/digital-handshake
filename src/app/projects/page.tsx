import { type Metadata } from 'next'

import { ProjectsPageContent } from '@/components/ProjectsPageContent'
import { getAllProjects } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Things I have worked on while learning and exploring.',
}

export default async function Projects() {
  let projects = await getAllProjects()

  return <ProjectsPageContent projects={projects} />
}
