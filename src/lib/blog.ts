import fs from 'node:fs'
import path from 'node:path'

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

export async function getAllBlogEntries() {
  let blogDir = path.join(process.cwd(), 'src/app/blog')
  let dirEntries = fs.readdirSync(blogDir, { withFileTypes: true })
  let entryFilenames = dirEntries
    .filter(
      (e) =>
        e.isDirectory() &&
        fs.existsSync(path.join(blogDir, e.name, 'page.en.mdx')),
    )
    .map((e) => `${e.name}/page.en.mdx`)

  let entries = await Promise.all(entryFilenames.map(importEntry))

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
