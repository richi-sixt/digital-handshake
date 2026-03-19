'use client'

import { useState } from 'react'
import clsx from 'clsx'

import { Card } from '@/components/Card'
import { formatDate } from '@/lib/formatDate'
import { useTranslation } from '@/i18n'
import { type ProjectWithSlug } from '@/lib/projects'

const PLAYGROUND_BASE = 'https://playground.sixt.services'

type CategoryFilter = 'all' | string

export function ProjectList({ projects }: { projects: ProjectWithSlug[] }) {
  let [category, setCategory] = useState<CategoryFilter>('all')
  let { t } = useTranslation()

  // Derive available categories from project data
  let categories = ['all', ...new Set(projects.map((p) => p.category))]

  let filtered =
    category === 'all'
      ? projects
      : projects.filter((p) => p.category === category)

  return (
    <>
      <div className="mb-8 flex gap-2">
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
          {filtered.map((project) => (
            <article
              key={project.slug}
              className="md:grid md:grid-cols-4 md:items-baseline"
            >
              <Card className="md:col-span-3">
                <Card.Title
                  href={`${PLAYGROUND_BASE}/apps/${project.slug}/`}
                >
                  {project.title}
                </Card.Title>
                <Card.Eyebrow
                  as="time"
                  dateTime={project.date}
                  className="md:hidden"
                  decorate
                >
                  {formatDate(project.date)}
                </Card.Eyebrow>
                <Card.Description>{project.description}</Card.Description>
                <div className="relative z-10 mt-4 flex flex-wrap gap-1">
                  {project.tech.map((tech) => (
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
                dateTime={project.date}
                className="mt-1 max-md:hidden"
              >
                {formatDate(project.date)}
              </Card.Eyebrow>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}
