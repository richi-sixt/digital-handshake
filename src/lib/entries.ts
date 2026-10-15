import { unstable_cache } from 'next/cache'

import { createPublicClient } from '@/lib/supabase/public'

export const ENTRIES_TAG = 'entries'

export type EntryKind = 'work' | 'education'

/** Row of the `entries` table (see supabase/migrations/0004_entries.sql). */
export interface EntryRow {
  id: string
  kind: EntryKind
  slug: string
  status: 'draft' | 'published'
  organization: string
  location: string | null
  field: string | null
  title_en: string
  title_de: string | null
  description_en: string
  description_de: string | null
  body_en: string
  body_de: string | null
  start_year: number
  end_year: number | null
  tech: string[]
  related_apps: string[]
  logo_url: string | null
  show_on_home: boolean
  created_at: string
  updated_at: string
}

/** Everything but the (long) Markdown bodies; used by lists and the home page. */
export type EntrySummary = Omit<EntryRow, 'body_en' | 'body_de'>

const SUMMARY_COLUMNS =
  'id, kind, slug, status, organization, location, field, title_en, title_de, description_en, description_de, start_year, end_year, tech, related_apps, logo_url, show_on_home, created_at, updated_at'

/** Newest first; an open end (present) counts as the newest. */
function byPeriodDesc(a: EntrySummary, z: EntrySummary) {
  return (
    z.start_year - a.start_year ||
    (z.end_year ?? 9999) - (a.end_year ?? 9999)
  )
}

/**
 * Published entries of one kind, newest first. Cached until
 * `updateTag('entries')` runs (save/delete in the admin) or one hour passed.
 * Returns [] if the table is missing or unreachable so pages keep rendering.
 */
export const getEntries = (kind: EntryKind) =>
  unstable_cache(
    async (): Promise<EntrySummary[]> => {
      let { data, error } = await createPublicClient()
        .from('entries')
        .select(SUMMARY_COLUMNS)
        .eq('kind', kind)
        .eq('status', 'published')

      if (error) {
        console.warn('[entries] could not load entries:', error.message)
        return []
      }
      return ((data ?? []) as EntrySummary[]).sort(byPeriodDesc)
    },
    ['entries', kind],
    { tags: [ENTRIES_TAG], revalidate: 3600 },
  )()

export const getEntry = (kind: EntryKind, slug: string) =>
  unstable_cache(
    async (): Promise<EntryRow | null> => {
      let { data, error } = await createPublicClient()
        .from('entries')
        .select('*')
        .eq('kind', kind)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()

      if (error) {
        console.warn('[entries] could not load entry:', error.message)
        return null
      }
      return (data as EntryRow | null) ?? null
    },
    ['entry', kind, slug],
    { tags: [ENTRIES_TAG], revalidate: 3600 },
  )()

/** Entries flagged "show on home", split by kind. */
export const getHomeEntries = unstable_cache(
  async (): Promise<{ work: EntrySummary[]; education: EntrySummary[] }> => {
    let { data, error } = await createPublicClient()
      .from('entries')
      .select(SUMMARY_COLUMNS)
      .eq('status', 'published')
      .eq('show_on_home', true)

    if (error) {
      console.warn('[entries] could not load home entries:', error.message)
      return { work: [], education: [] }
    }

    let rows = ((data ?? []) as EntrySummary[]).sort(byPeriodDesc)
    return {
      work: rows.filter((e) => e.kind === 'work'),
      education: rows.filter((e) => e.kind === 'education'),
    }
  },
  ['home-entries'],
  { tags: [ENTRIES_TAG], revalidate: 3600 },
)
