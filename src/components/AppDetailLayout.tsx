// Async server component wrapper — fetches blog posts and passes them to AppLayout.

import { AppLayout } from '@/components/AppLayout'
import { getBlogEntriesForApp } from '@/lib/blog'

export async function AppDetailLayout({
  app,
  children,
}: {
  app: {
    title: string
    description: string
    tech: string[]
    url?: string
    github?: string
    date: string
    category: 'games' | 'misc'
    slug?: string
  }
  children: React.ReactNode
}) {
  // Extract slug from the app URL: '/apps/memory-game/play/' → 'memory-game'
  let slug =
    app.slug || app.url?.match(/\/apps\/([^/]+)/)?.[1] || ''

  let blogEntries = await getBlogEntriesForApp(slug)

  return (
    <AppLayout app={{ ...app, slug }} blogEntries={blogEntries}>
      {children}
    </AppLayout>
  )
}
