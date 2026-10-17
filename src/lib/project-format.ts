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
