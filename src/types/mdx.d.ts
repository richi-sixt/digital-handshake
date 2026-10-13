declare module '*.mdx' {
  import type { ComponentType } from 'react'
  import type { BlogEntry } from '@/lib/blog'
  import type { App } from '@/lib/apps'
  import type { WorkWithSlug } from '@/lib/work'
  import type { EducationWithSlug } from '@/lib/education'

  const component: ComponentType
  export default component
  export const entry: BlogEntry
  export const app: App
  export const work: WorkWithSlug
  export const education: EducationWithSlug
}
