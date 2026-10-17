import Link from 'next/link'

import { formatDate } from '@/lib/formatDate'
import { createClient } from '@/lib/supabase/server'

export default async function ProjectAdminList() {
  let supabase = await createClient()
  let { data, error } = await supabase
    .from('projects')
    .select('id, slug, status, title_en, category, date')
    .order('date', { ascending: false })

  let projects = data ?? []

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          Projekte
        </h1>
        <Link
          href="/admin/projects/new"
          className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
        >
          Neues Projekt
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Projekte konnten nicht geladen werden: {error.message}. Wurde{' '}
          <code>supabase/migrations/0005_projects.sql</code> ausgeführt?
        </p>
      )}

      <ul className="mt-6 divide-y divide-zinc-100 dark:divide-zinc-700/40">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              href={`/admin/projects/${project.id}`}
              className="flex items-center justify-between gap-4 py-3 hover:text-violet-500"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-zinc-800 dark:text-zinc-100">
                  {project.title_en}
                </span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDate(project.date)} · {project.category} · /{project.slug}
                </span>
              </span>
              <span
                className={
                  project.status === 'published'
                    ? 'shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    : 'shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }
              >
                {project.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
              </span>
            </Link>
          </li>
        ))}
        {projects.length === 0 && !error && (
          <li className="py-6 text-sm text-zinc-500 dark:text-zinc-400">
            Noch keine Projekte.
          </li>
        )}
      </ul>
    </>
  )
}
