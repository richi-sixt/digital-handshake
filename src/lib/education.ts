
import fs from 'node:fs'
import path from 'node:path'

interface Education {
  institution: string
  degree: string
  field?: string
  location?: string
  period: string
  description: string
  date: string
  tech?: string[]
}

export interface EducationWithSlug extends Education {
  slug: string
}

async function importEducation(
  educationFilename: string,
): Promise<EducationWithSlug> {
  let { education } = (await import(
    `../app/education/${educationFilename}`
  )) as {
    default: React.ComponentType
    education: Education
  }

  return {
    slug: educationFilename.replace(/(\/page)?\.en\.mdx$/, ''),
    ...education,
  }
}

export async function getAllEducation() {
  let dir = path.join(process.cwd(), 'src/app/education')
  let educationFilenames = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(
      (e) =>
        e.isDirectory() && fs.existsSync(path.join(dir, e.name, 'page.en.mdx')),
    )
    .map((e) => `${e.name}/page.en.mdx`)

  let educations = await Promise.all(educationFilenames.map(importEducation))

  return educations.sort((a, z) => +new Date(z.date) - +new Date(a.date))
}
