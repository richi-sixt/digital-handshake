import { type Metadata } from 'next'

import { SimpleLayout } from '@/components/SimpleLayout'
import { ProjectList } from '@/components/ProjectList'
import { getAllProjects } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Things I have worked on while learning and exploring.',
}

export default async function Projects() {
  let projects = await getAllProjects()

  return (
    <SimpleLayout
      title="Things I've worked on"
      intro="while learning and exploring."
    >
      <ProjectList projects={projects} /> 
    </SimpleLayout>
  )
}
