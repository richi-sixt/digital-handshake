declare module '*.mdx' {
  import type { ComponentType } from 'react'
  import type { JournalEntry } from '@/lib/journal'
  import type { App } from '@/lib/apps'
  import type { WorkWithSlug } from '@/lib/work'
  import type { EducationWithSlug } from '@/lib/education'

  const component: ComponentType
  export default component
  export const entry: JournalEntry
  export const app: App
  export const work: WorkWithSlug
  export const education: EducationWithSlug
}
