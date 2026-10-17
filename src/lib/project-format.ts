import { type ProjectSummary } from '@/lib/projects'

type Locale = string

/** Localized title; German falls back to English when empty. */
export function projectTitle(project: ProjectSummary, locale: Locale) {
  return locale === 'de' && project.title_de ? project.title_de : project.title_en
}

export function projectDescription(project: ProjectSummary, locale: Locale) {
  return locale === 'de' && project.description_de
    ? project.description_de
    : project.description_en
}

const KNOWN_FILTER_KEYS = {
  games: 'filter.games',
  tools: 'filter.tools',
  web: 'filter.web',
  misc: 'filter.misc',
} as const

/** Display label of a category: translated if known, else the humanized slug. */
export function categoryLabel(
  t: (key: (typeof KNOWN_FILTER_KEYS)[keyof typeof KNOWN_FILTER_KEYS]) => string,
  category: string,
) {
  let key = KNOWN_FILTER_KEYS[category as keyof typeof KNOWN_FILTER_KEYS]
  return key ? t(key) : category.replace(/-/g, ' ')
}

const CATEGORY_ORDER = ['games', 'tools', 'web', 'misc']

/** Known categories first (in their usual order), new ones alphabetically after. */
export function sortCategories(categories: string[]) {
  let rank = (c: string) => {
    let i = CATEGORY_ORDER.indexOf(c)
    return i === -1 ? CATEGORY_ORDER.length : i
  }
  return [...categories].sort((a, z) => rank(a) - rank(z) || a.localeCompare(z))
}
