import { getPublishedPosts, type PostSummary } from '@/lib/posts'

interface BlogEntry {
  title: string
  description: string
  date: string
  category: string
  tags?: string[]
  relatedApps?: string[]
  relatedWork?: string[]
}

export interface BlogEntryWithSlug extends BlogEntry {
  slug: string
  /** German title/description (falls back to English when empty). */
  titleDe?: string | null
  descriptionDe?: string | null
}

function fromPost(post: PostSummary): BlogEntryWithSlug {
  return {
    slug: post.slug,
    title: post.title_en,
    description: post.description_en,
    titleDe: post.title_de,
    descriptionDe: post.description_de,
    date: post.date,
    category: post.category,
    tags: post.tags,
    relatedApps: post.related_apps,
    relatedWork: post.related_work,
  }
}

/** All published blog entries from the database, newest first. */
export async function getAllBlogEntries() {
  let posts = await getPublishedPosts()
  return posts.map(fromPost)
}

export async function getBlogEntriesForApp(appSlug: string) {
  let entries = await getAllBlogEntries()
  return entries.filter((e) => e.relatedApps?.includes(appSlug))
}

export async function getBlogEntriesForWork(workSlug: string) {
  let entries = await getAllBlogEntries()
  return entries.filter((e) => e.relatedWork?.includes(workSlug))
}

export async function getBlogCategories() {
  let entries = await getAllBlogEntries()
  return [...new Set(entries.map((e) => e.category))]
}
