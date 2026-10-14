import fs from 'node:fs'
import path from 'node:path'

interface Work {
  company: string
  title: string
  location: string
  period: string
  description: string
  date: string
  tech?: string[]
  relatedProjects?: string[]
}

export interface WorkWithSlug extends Work {
  slug: string
}

async function importWork(workFilename: string): Promise<WorkWithSlug> {
  let { work } = (await import(`../app/work/${workFilename}`)) as {
    default: React.ComponentType
    work: Work
  }

  return {
    slug: workFilename.replace(/(\/page)?\.en\.mdx$/, ''),
    ...work,
  }
}

export async function getAllWork() {
  let dir = path.join(process.cwd(), 'src/app/work')
  let workFilenames = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(
      (e) =>
        e.isDirectory() && fs.existsSync(path.join(dir, e.name, 'page.en.mdx')),
    )
    .map((e) => `${e.name}/page.en.mdx`)

  let works = await Promise.all(workFilenames.map(importWork))

  return works.sort((a, z) => +new Date(z.date) - +new Date(a.date))
}
