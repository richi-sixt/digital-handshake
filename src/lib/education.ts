
import glob from 'fast-glob'

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
  let educationFilenames = await glob('*/page.en.mdx', {
    cwd: './src/app/education',
  })

  let educations = await Promise.all(educationFilenames.map(importEducation))

  return educations.sort((a, z) => +new Date(z.date) - +new Date(a.date))
}
