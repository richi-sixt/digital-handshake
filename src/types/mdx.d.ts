declare module '*.mdx' {
  import type { ComponentType } from 'react'
  import type { App } from '@/lib/apps'

  const component: ComponentType
  export default component
  export const app: App
}
