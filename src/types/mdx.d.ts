declare module '*.mdx' {
  import type { ComponentType } from 'react'
  import type { WorkWithSlug } from '@/lib/work'
  import type { EducationWithSlug } from '@/lib/education'
  import type { ProjectWithSlug } from '@/lib/projects'

  const component: ComponentType
  export default component
  export const work: WorkWithSlug
  export const education: EducationWithSlug
  export const project: ProjectWithSlug
}
