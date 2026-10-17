import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { AppLayout } from '@/components/AppLayout'
import { LocalizedBody } from '@/components/LocalizedBody'
import { Markdown } from '@/components/Markdown'
import { getBlogEntriesForApp } from '@/lib/blog'
import { getProject } from '@/lib/projects'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let { slug } = await params
  let project = await getProject(slug)
  if (!project) return {}

  return { title: project.title_en, description: project.description_en }
}

// Playable routes live in code (src/app/apps/<slug>/play/...) and win over
// this dynamic route; everything else is served from the database.
export default async function AppPage({ params }: Props) {
  let { slug } = await params
  let project = await getProject(slug)
  if (!project) notFound()

  let blogEntries = await getBlogEntriesForApp(slug)

  return (
    <AppLayout app={project} blogEntries={blogEntries}>
      <LocalizedBody
        en={<Markdown>{project.body_en}</Markdown>}
        de={project.body_de ? <Markdown>{project.body_de}</Markdown> : null}
      />
    </AppLayout>
  )
}
