import { notFound } from 'next/navigation'

import { ProjectEditor } from '@/app/admin/(protected)/projects/ProjectEditor'
import { type ProjectRow } from '@/lib/projects'
import { createClient } from '@/lib/supabase/server'

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  let { id } = await params
  let supabase = await createClient()
  let { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (!project) notFound()

  return <ProjectEditor initial={project as ProjectRow} />
}
