import fs from 'node:fs'
import path from 'node:path'

export interface ProjectWithSlug {
  slug: string
  title: string
  description: string
  tech: string[]
  url?: string
  github?: string
  date: string
  category: string
}

const PLAYGROUND_PROJECTS_PATH = path.join(
  process.cwd(),
  'data/playground-projects.json',
)

/**
 * Load projects from playground's exported JSON.
 * Falls back to an empty array if the file doesn't exist yet.
 */
export async function getAllProjects(): Promise<ProjectWithSlug[]> {
  if (!fs.existsSync(PLAYGROUND_PROJECTS_PATH)) {
    console.warn(
      'Warning: data/playground-projects.json not found. Run "npm run sync-projects" first.',
    )
    return []
  }

  const raw = fs.readFileSync(PLAYGROUND_PROJECTS_PATH, 'utf-8')
  const projects: ProjectWithSlug[] = JSON.parse(raw)

  return projects.sort((a, z) => +new Date(z.date) - +new Date(a.date))
}
