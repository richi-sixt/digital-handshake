import fs from 'node:fs'
import path from 'node:path'

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
  /** German title/description for posts from the database. */
  titleDe?: string | null
  descriptionDe?: string | null
  /** 'db' = Supabase post, 'file' = legacy MDX entry from the journal/ submodule. */
  source?: 'db' | 'file'
}

async function importEntry(
  entryFilename: string,
): Promise<BlogEntryWithSlug> {
  let { entry } = (await import(`../app/blog/${entryFilename}`)) as {
    default: React.ComponentType
    entry: BlogEntry
  }

  return {
    slug: entryFilename.replace(/(\/page)?\.en\.mdx$/, ''),
    ...entry,
  }
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
    source: 'db',
  }
}

/** Legacy entries: MDX folders generated from the journal/ submodule. */
async function getFileEntries(): Promise<BlogEntryWithSlug[]> {
  let blogDir = path.join(process.cwd(), 'src/app/blog')
  if (!fs.existsSync(blogDir)) return []

  let dirEntries = fs.readdirSync(blogDir, { withFileTypes: true })
  let entryFilenames = dirEntries
    .filter(
      (e) =>
        e.isDirectory() &&
        fs.existsSync(path.join(blogDir, e.name, 'page.en.mdx')),
    )
    .map((e) => `${e.name}/page.en.mdx`)

  let entries = await Promise.all(entryFilenames.map(importEntry))
  return entries.map((e) => ({ ...e, source: 'file' as const }))
}

/**
 * All blog entries, newest first: published posts from the database plus the
 * legacy MDX entries (until they are imported). A database post wins if both
 * share a slug.
 */
export async function getAllBlogEntries() {
  let [posts, files] = await Promise.all([
    getPublishedPosts(),
    getFileEntries(),
  ])

  let dbEntries = posts.map(fromPost)
  let dbSlugs = new Set(dbEntries.map((e) => e.slug))
  let entries = [...dbEntries, ...files.filter((e) => !dbSlugs.has(e.slug))]

  return entries.sort((a, z) => +new Date(z.date) - +new Date(a.date))
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
