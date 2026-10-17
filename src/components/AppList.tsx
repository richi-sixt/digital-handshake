'use client'

import { useState } from 'react'
import clsx from 'clsx'

import { Card } from '@/components/Card'
import { formatDate } from '@/lib/formatDate'
import { useTranslation } from '@/i18n'
import {
  projectDescription,
  projectTitle,
} from '@/lib/project-format'
import { type ProjectSummary } from '@/lib/projects'

type CategoryFilter = 'all' | 'games' | 'tools' | 'web'

const categoryKeys = {
  all: 'filter.all',
  games: 'filter.games',
  tools: 'filter.tools',
  web: 'filter.web',
//  misc: 'filter.misc',
} as const

export function AppList({ apps }: { apps: ProjectSummary[] }) {
  let [category, setCategory] = useState<CategoryFilter>('all')
  let { t, locale } = useTranslation()

  let filtered =
    category === 'all'
      ? apps
      : apps.filter((a) => a.category === category)

  return (
    <>
      <div className="mb-8 flex gap-2">
        {(['all', 'games', 'tools', 'web'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={clsx(
              'rounded-full px-4 py-1.5 text-sm font-medium transition',
              category === cat
                ? 'bg-violet-500 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700',
            )}
          >
            {t(categoryKeys[cat])}
          </button>
        ))}
      </div>

      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-16">
          {filtered.map((app) => (
            <article
              key={app.slug}
              className="md:grid md:grid-cols-4 md:items-baseline"
            >
              <Card className="md:col-span-3">
                <Card.Title href={`/apps/${app.slug}`}>
                  {projectTitle(app, locale)}
                </Card.Title>
                <Card.Eyebrow
                  as="time"
                  dateTime={app.date}
                  className="md:hidden"
                  decorate
                >
                  {formatDate(app.date, locale)}
                </Card.Eyebrow>
                <Card.Description>{projectDescription(app, locale)}</Card.Description>
                <div className="relative z-10 mt-4 flex flex-wrap gap-1">
                  {app.tech.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <Card.Cta>{t('card.readMore')}</Card.Cta>
              </Card>
              <Card.Eyebrow
                as="time"
                dateTime={app.date}
                className="mt-1 max-md:hidden"
              >
                {formatDate(app.date, locale)}
              </Card.Eyebrow>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}
