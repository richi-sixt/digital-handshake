'use client'

import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { useTranslation } from '@/i18n'
import { type EntryKind, type EntrySummary } from '@/lib/entries'
import {
  entryDescription,
  entryTitle,
  formatPeriod,
} from '@/lib/entry-format'

function EntryItem({
  kind,
  entry,
}: {
  kind: EntryKind
  entry: EntrySummary
}) {
  let { t, locale } = useTranslation()
  let period = formatPeriod(entry, t('home.present'))
  let title = entryTitle(entry, locale)

  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        <Card.Title href={`/${kind}/${entry.slug}/`}>
          {entry.organization}
        </Card.Title>
        <Card.Eyebrow
          as="time"
          dateTime={String(entry.start_year)}
          className="md:hidden"
          decorate
        >
          {period}
        </Card.Eyebrow>
        <p className="relative z-10 mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {title}
        </p>
        <Card.Description>{entryDescription(entry, locale)}</Card.Description>
        {entry.tech.length > 0 && (
          <div className="relative z-10 mt-4 flex flex-wrap gap-1">
            {entry.tech.map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
        <Card.Cta>{t('card.readMore')}</Card.Cta>
      </Card>
      <Card.Eyebrow
        as="time"
        dateTime={String(entry.start_year)}
        className="mt-1 max-md:hidden"
      >
        {period}
      </Card.Eyebrow>
    </article>
  )
}

/** List page for /work and /education. */
export function EntryList({
  kind,
  entries,
}: {
  kind: EntryKind
  entries: EntrySummary[]
}) {
  let { t } = useTranslation()

  return (
    <SimpleLayout title={t(`${kind}.title`)} intro={t(`${kind}.intro`)}>
      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-16">
          {entries.map((entry) => (
            <EntryItem key={entry.id} kind={kind} entry={entry} />
          ))}
        </div>
      </div>
    </SimpleLayout>
  )
}
