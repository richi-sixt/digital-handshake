import { type ProjectCategory } from '@/lib/projects'
import { SLUG_RE } from '@/lib/post-input'

/** Fields the admin editor sends to the `saveProject` server action. */
export interface ProjectInput {
  id?: string
  slug: string
  status: 'draft' | 'published'
  title_en: string
  title_de: string
  description_en: string
  description_de: string
  body_en: string
  body_de: string
  tech: string[]
  url: string
  github: string
  date: string
  category: ProjectCategory
}

const CATEGORIES: ProjectCategory[] = ['games', 'tools', 'web', 'misc']
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Returns an error message, or null when the input is valid. */
export function validateProjectInput(input: ProjectInput): string | null {
  if (!SLUG_RE.test(input.slug)) {
    return 'Slug: nur Kleinbuchstaben, Zahlen und Bindestriche (z. B. uno).'
  }
  if (!input.title_en.trim()) return 'Titel (EN) fehlt.'
  if (!DATE_RE.test(input.date) || Number.isNaN(Date.parse(input.date))) {
    return 'Datum ungültig.'
  }
  if (!CATEGORIES.includes(input.category)) return 'Kategorie ungültig.'
  if (input.status !== 'draft' && input.status !== 'published') {
    return 'Status ungültig.'
  }
  let url = input.url.trim()
  if (url && !/^(https?:\/\/|\/)/.test(url)) {
    return 'URL muss mit https://, http:// oder / beginnen.'
  }
  let github = input.github.trim()
  if (github && !/^https?:\/\//.test(github)) {
    return 'GitHub-URL muss mit https:// beginnen.'
  }
  return null
}
