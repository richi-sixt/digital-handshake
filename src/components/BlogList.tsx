'use client'

import { useState } from 'react'
import clsx from 'clsx'

import { Card } from '@/components/Card'
import { formatDate } from '@/lib/formatDate'
import { useTranslation } from '@/i18n'
import { type BlogEntryWithSlug } from '@/lib/blog'
import { te } from '@/lib/translatedEntry'

export function BlogList({ entries }: { entries: BlogEntryWithSlug[] }) {
  let [category, setCategory] = useState('all')
  let { t, locale } = useTranslation()

  let categories = [
    'all',
    ...new Set(entries.map((e) => e.category).sort()),
  ]

  let filtered =
    category === 'all'
      ? entries
      : entries.filter((e) => e.category === category)

  return (
    <>
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={clsx(
              'rounded-full px-4 py-1.5 text-sm font-medium capitalize transition',
              category === cat
                ? 'bg-violet-500 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700',
            )}
          >
            {cat === 'all' ? t('filter.all') : cat}
          </button>
        ))}
      </div>

      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-16">
          {filtered.map((entry) => (
            <article
              key={entry.slug}
              className="md:grid md:grid-cols-4 md:items-baseline"
            >
              <Card className="md:col-span-3">
                <Card.Title href={`/blog/${entry.slug}/`}>
                  {te(t, `blog.${entry.slug}.title`, locale === 'de' && entry.titleDe ? entry.titleDe : entry.title)}
                </Card.Title>
                <Card.Eyebrow
                  as="time"
                  dateTime={entry.date}
                  className="md:hidden"
                  decorate
                >
                  {formatDate(entry.date, locale)}
                </Card.Eyebrow>
                <Card.Description>{te(t, `blog.${entry.slug}.description`, locale === 'de' && entry.descriptionDe ? entry.descriptionDe : entry.description)}</Card.Description>
                <div className="relative z-10 mt-4 flex flex-wrap gap-1">
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                    {entry.category}
                  </span>
                  {entry.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Card.Cta>{t('card.readMore')}</Card.Cta>
              </Card>
              <Card.Eyebrow
                as="time"
                dateTime={entry.date}
                className="mt-1 max-md:hidden"
              >
                {formatDate(entry.date, locale)}
              </Card.Eyebrow>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}
