import { unstable_cache } from 'next/cache'

import { createPublicClient } from '@/lib/supabase/public'

export const PROJECTS_TAG = 'projects'

export type ProjectCategory = 'games' | 'tools' | 'web' | 'misc'

/** Row of the `projects` table (see supabase/migrations/0005_projects.sql). */
export interface ProjectRow {
  id: string
  slug: string
  status: 'draft' | 'published'
  title_en: string
  title_de: string | null
  description_en: string
  description_de: string | null
  body_en: string
  body_de: string | null
  tech: string[]
  url: string | null
  github: string | null
  date: string
  category: ProjectCategory
  created_at: string
  updated_at: string
}

/** Everything but the (long) Markdown bodies; used by lists and cards. */
export type ProjectSummary = Omit<ProjectRow, 'body_en' | 'body_de'>

const SUMMARY_COLUMNS =
  'id, slug, status, title_en, title_de, description_en, description_de, tech, url, github, date, category, created_at, updated_at'

/**
 * Published projects, newest first. Cached until `updateTag('projects')` runs
 * (save/delete in the admin) or one hour has passed. Returns [] if the table
 * is missing or unreachable so pages keep rendering.
 */
export const getProjects = unstable_cache(
  async (): Promise<ProjectSummary[]> => {
    let { data, error } = await createPublicClient()
      .from('projects')
      .select(SUMMARY_COLUMNS)
      .eq('status', 'published')
      .order('date', { ascending: false })

    if (error) {
      console.warn('[projects] could not load projects:', error.message)
      return []
    }
    return (data ?? []) as ProjectSummary[]
  },
  ['projects'],
  { tags: [PROJECTS_TAG], revalidate: 3600 },
)

export const getProject = (slug: string) =>
  unstable_cache(
    async (): Promise<ProjectRow | null> => {
      let { data, error } = await createPublicClient()
        .from('projects')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()

      if (error) {
        console.warn('[projects] could not load project:', error.message)
        return null
      }
      return (data as ProjectRow | null) ?? null
    },
    ['project', slug],
    { tags: [PROJECTS_TAG], revalidate: 3600 },
  )()
