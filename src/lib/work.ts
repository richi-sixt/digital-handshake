import glob from 'fast-glob'

interface Work {
  company: string
  title: string
  location: string
  period: string
  description: string
  date: string
  tech?: string[]
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
    slug: workFilename.replace(/(\/page)?\.mdx$/, ''),
    ...work,
  }
}

export async function getAllWork() {
  let workFilenames = await glob('*/page.mdx', {
    cwd: './src/app/work',
  })

  let works = await Promise.all(workFilenames.map(importWork))

  return works.sort((a, z) => +new Date(z.date) - +new Date(a.date))
}
