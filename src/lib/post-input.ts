/** Fields the admin editor sends to the `savePost` server action. */
export interface PostInput {
  id?: string
  slug: string
  status: 'draft' | 'published'
  date: string
  category: string
  tags: string[]
  related_apps: string[]
  related_work: string[]
  title_en: string
  title_de: string
  description_en: string
  description_de: string
  body_en: string
  body_de: string
}

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Returns an error message, or null when the input is valid. */
export function validatePostInput(input: PostInput): string | null {
  if (!SLUG_RE.test(input.slug)) {
    return 'Slug: nur Kleinbuchstaben, Zahlen und Bindestriche (z. B. mein-beitrag).'
  }
  if (!input.title_en.trim()) return 'Titel (EN) fehlt.'
  if (!DATE_RE.test(input.date) || Number.isNaN(Date.parse(input.date))) {
    return 'Datum ungültig.'
  }
  if (!input.category.trim()) return 'Kategorie fehlt.'
  if (input.status !== 'draft' && input.status !== 'published') {
    return 'Status ungültig.'
  }
  return null
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
