import { unstable_cache } from 'next/cache'

import { createPublicClient } from '@/lib/supabase/public'

export const POSTS_TAG = 'posts'

/** Row of the `posts` table (see supabase/migrations/0002_posts.sql). */
export interface PostRow {
  id: string
  slug: string
  status: 'draft' | 'published'
  date: string
  category: string
  tags: string[]
  related_apps: string[]
  related_work: string[]
  title_en: string
  title_de: string | null
  description_en: string
  description_de: string | null
  body_en: string
  body_de: string | null
  cover_image: string | null
  created_at: string
  updated_at: string
}

const LIST_COLUMNS =
  'id, slug, status, date, category, tags, related_apps, related_work, title_en, title_de, description_en, description_de, cover_image, created_at, updated_at'

export type PostSummary = Pick<
  PostRow,
  | 'id'
  | 'slug'
  | 'status'
  | 'date'
  | 'category'
  | 'tags'
  | 'related_apps'
  | 'related_work'
  | 'title_en'
  | 'title_de'
  | 'description_en'
  | 'description_de'
  | 'cover_image'
  | 'created_at'
  | 'updated_at'
>

/**
 * Published posts, newest first. Cached until `revalidateTag('posts')` runs
 * (on save/publish in the admin) or one hour has passed. Returns [] if the
 * table is missing or unreachable so the blog keeps working.
 */
export const getPublishedPosts = unstable_cache(
  async (): Promise<PostSummary[]> => {
    let { data, error } = await createPublicClient()
      .from('posts')
      .select(LIST_COLUMNS)
      .eq('status', 'published')
      .order('date', { ascending: false })

    if (error) {
      console.warn('[posts] could not load posts:', error.message)
      return []
    }
    return (data ?? []) as PostSummary[]
  },
  ['published-posts'],
  { tags: [POSTS_TAG], revalidate: 3600 },
)

export const getPublishedPostBySlug = (slug: string) =>
  unstable_cache(
    async (): Promise<PostRow | null> => {
      let { data, error } = await createPublicClient()
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()

      if (error) {
        console.warn('[posts] could not load post:', error.message)
        return null
      }
      return (data as PostRow | null) ?? null
    },
    ['published-post', slug],
    { tags: [POSTS_TAG], revalidate: 3600 },
  )()
