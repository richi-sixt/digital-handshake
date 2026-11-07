import { unstable_cache } from 'next/cache'

import { createPublicClient } from '@/lib/supabase/public'

export const SKILLS_TAG = 'skills'

export type SkillCategory = 'methodical' | 'technical'

export const SKILL_CATEGORIES: SkillCategory[] = ['methodical', 'technical']

/** Row of the `skills` table (see supabase/migrations/0007_skills.sql). */
export interface SkillRow {
  id: string
  category: SkillCategory
  name: string
  url: string
  icon_url: string | null
  sort_order: number
}

export const SKILL_COLUMNS = 'id, category, name, url, icon_url, sort_order'

/**
 * All skills in display order. Cached until `updateTag('skills')` runs
 * (save/delete in the admin) or one hour passed. Returns [] if the table is
 * missing or unreachable so the home page keeps rendering.
 */
export const getSkills = unstable_cache(
  async (): Promise<SkillRow[]> => {
    let { data, error } = await createPublicClient()
      .from('skills')
      .select(SKILL_COLUMNS)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.warn('[skills] could not load skills:', error.message)
      return []
    }
    return (data ?? []) as SkillRow[]
  },
  ['skills'],
  { tags: [SKILLS_TAG], revalidate: 3600 },
)
