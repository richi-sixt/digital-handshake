import { type EntryKind } from '@/lib/entries'
import { SLUG_RE } from '@/lib/post-input'

/** Fields the admin editor sends to the `saveEntry` server action. */
export interface EntryInput {
  id?: string
  kind: EntryKind
  slug: string
  status: 'draft' | 'published'
  organization: string
  location: string
  field: string
  title_en: string
  title_de: string
  description_en: string
  description_de: string
  body_en: string
  body_de: string
  start_year: number
  end_year: number | null
  tech: string[]
  related_apps: string[]
  logo_url: string
  show_on_home: boolean
}

const validYear = (n: number) => Number.isInteger(n) && n >= 1900 && n <= 2100

/** Returns an error message, or null when the input is valid. */
export function validateEntryInput(input: EntryInput): string | null {
  if (input.kind !== 'work' && input.kind !== 'education') return 'Typ ungültig.'
  if (!SLUG_RE.test(input.slug)) {
    return 'Slug: nur Kleinbuchstaben, Zahlen und Bindestriche (z. B. die-mobiliar).'
  }
  if (!input.organization.trim()) {
    return input.kind === 'work' ? 'Firma fehlt.' : 'Institution fehlt.'
  }
  if (!input.title_en.trim()) return 'Titel (EN) fehlt.'
  if (!validYear(input.start_year)) return 'Startjahr ungültig.'
  if (input.end_year !== null) {
    if (!validYear(input.end_year)) return 'Endjahr ungültig.'
    if (input.end_year < input.start_year) {
      return 'Das Endjahr liegt vor dem Startjahr.'
    }
  }
  if (input.status !== 'draft' && input.status !== 'published') {
    return 'Status ungültig.'
  }
  return null
}
