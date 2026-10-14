import Link from 'next/link'

import { formatDate } from '@/lib/formatDate'
import { type PostSummary } from '@/lib/posts'
import { createClient } from '@/lib/supabase/server'

export default async function AdminHome() {
  let supabase = await createClient()
  let { data, error } = await supabase
    .from('posts')
    .select('id, slug, status, date, title_en, category, updated_at')
    .order('date', { ascending: false })

  let posts = (data ?? []) as Pick<
    PostSummary,
    'id' | 'slug' | 'status' | 'date' | 'title_en' | 'category' | 'updated_at'
  >[]

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Beiträge
        </h1>
        <Link
          href="/admin/posts/new"
          className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
        >
          Neuer Beitrag
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Beiträge konnten nicht geladen werden: {error.message}. Wurde{' '}
          <code>supabase/migrations/0002_posts.sql</code> ausgeführt?
        </p>
      )}

      <ul className="mt-6 divide-y divide-zinc-100 dark:divide-zinc-700/40">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/admin/posts/${post.id}`}
              className="flex items-center justify-between gap-4 py-3 hover:text-violet-500"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-zinc-800 dark:text-zinc-100">
                  {post.title_en}
                </span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDate(post.date)} · {post.category} · /{post.slug}
                </span>
              </span>
              <span
                className={
                  post.status === 'published'
                    ? 'shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }
              >
                {post.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
              </span>
            </Link>
          </li>
        ))}
        {posts.length === 0 && !error && (
          <li className="py-6 text-sm text-zinc-500 dark:text-zinc-400">
            Noch keine Beiträge in der Datenbank.
          </li>
        )}
      </ul>
    </>
  )
}
