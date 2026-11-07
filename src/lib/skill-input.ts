import { SKILL_CATEGORIES, type SkillCategory } from '@/lib/skills'

/** Fields the admin editor sends to the `saveSkill` server action. */
export interface SkillInput {
  id?: string
  category: SkillCategory
  name: string
  url: string
  icon_url: string
}

/** Returns an error message, or null when the input is valid. */
export function validateSkillInput(input: SkillInput): string | null {
  if (!SKILL_CATEGORIES.includes(input.category)) return 'Kategorie ungültig.'
  if (!input.name.trim()) return 'Name fehlt.'
  let url = input.url.trim()
  if (url && !/^https?:\/\//.test(url)) {
    return 'URL muss mit https:// oder http:// beginnen.'
  }
  let icon = input.icon_url.trim()
  if (icon && !/^https?:\/\//.test(icon)) return 'Icon-URL ungültig.'
  return null
}
