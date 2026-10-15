import { type EntrySummary } from '@/lib/entries'

type Locale = string

/** Localized role/degree; German falls back to English when empty. */
export function entryTitle(entry: EntrySummary, locale: Locale) {
  return locale === 'de' && entry.title_de ? entry.title_de : entry.title_en
}

export function entryDescription(entry: EntrySummary, locale: Locale) {
  return locale === 'de' && entry.description_de
    ? entry.description_de
    : entry.description_en
}

/** "2013 – Present"; `presentLabel` is the translated word for an open end. */
export function formatPeriod(
  entry: Pick<EntrySummary, 'start_year' | 'end_year'>,
  presentLabel: string,
) {
  if (entry.end_year === entry.start_year) return String(entry.start_year)
  return `${entry.start_year} – ${entry.end_year ?? presentLabel}`
}
