import { SLUG_RE, slugify } from '@/lib/post-input'
import { type ProjectCategory } from '@/lib/projects'

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

/** "Mobile Apps" -> "mobile-apps": categories are stored as lowercase slugs. */
export const normalizeCategory = (text: string): ProjectCategory => slugify(text)

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
  if (!SLUG_RE.test(normalizeCategory(input.category))) {
    return 'Kategorie: Buchstaben, Zahlen und Bindestriche (z. B. mobile).'
  }
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
