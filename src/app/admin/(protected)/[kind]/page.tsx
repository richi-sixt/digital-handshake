import Link from 'next/link'

import { KIND_LABELS, parseKind } from '@/app/admin/(protected)/[kind]/kinds'
import { type EntrySummary } from '@/lib/entries'
import { formatPeriod } from '@/lib/entry-format'
import { createClient } from '@/lib/supabase/server'

export default async function EntryAdminList({
  params,
}: {
  params: Promise<{ kind: string }>
}) {
  let kind = parseKind((await params).kind)
  let labels = KIND_LABELS[kind]

  let supabase = await createClient()
  let { data, error } = await supabase
    .from('entries')
    .select('id, slug, status, organization, title_en, start_year, end_year, show_on_home')
    .eq('kind', kind)
    .order('start_year', { ascending: false })

  let entries = (data ?? []) as Pick<
    EntrySummary,
    'id' | 'slug' | 'status' | 'organization' | 'title_en' | 'start_year' | 'end_year' | 'show_on_home'
  >[]

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          {labels.plural}
        </h1>
        <Link
          href={`/admin/${kind}/new`}
          className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
        >
          Neuer Eintrag
        </Link>
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Einträge konnten nicht geladen werden: {error.message}. Wurde{' '}
          <code>supabase/migrations/0004_entries.sql</code> ausgeführt?
        </p>
      )}

      <ul className="mt-6 divide-y divide-zinc-100 dark:divide-zinc-700/40">
        {entries.map((entry) => (
          <li key={entry.id}>
            <Link
              href={`/admin/${kind}/${entry.id}`}
              className="flex items-center justify-between gap-4 py-3 hover:text-violet-500"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-zinc-800 dark:text-zinc-100">
                  {entry.organization}
                </span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                  {entry.title_en} · {formatPeriod(entry, 'Heute')} · /{entry.slug}
                </span>
              </span>
              <span className="flex shrink-0 gap-2">
                {entry.show_on_home && (
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                    Startseite
                  </span>
                )}
                <span
                  className={
                    entry.status === 'published'
                      ? 'rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }
                >
                  {entry.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                </span>
              </span>
            </Link>
          </li>
        ))}
        {entries.length === 0 && !error && (
          <li className="py-6 text-sm text-zinc-500 dark:text-zinc-400">
            Noch keine Einträge.
          </li>
        )}
      </ul>
    </>
  )
}
