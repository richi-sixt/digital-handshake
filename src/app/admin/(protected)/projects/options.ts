import { createClient } from '@/lib/supabase/server'

/** Projects (incl. drafts) for the "linked projects" picker of work entries. */
export async function getProjectOptions() {
  let supabase = await createClient()
  let { data } = await supabase
    .from('projects')
    .select('slug, title_en')
    .order('title_en')

  return (data ?? []).map((p) => ({ slug: p.slug, title: p.title_en }))
}

/** Categories already in use (incl. drafts), as suggestions in the editor. */
export async function getProjectCategories() {
  let supabase = await createClient()
  let { data } = await supabase.from('projects').select('category')

  return [...new Set((data ?? []).map((p) => p.category))].sort()
}
