
'use client'

import { useState } from 'react'
import clsx from 'clsx'

import { Card } from '@/components/Card'
import { formatDate } from '@/lib/formatDate'
import { type ProjectWithSlug } from '@/lib/projects'

function LinkIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M15.712 11.823a.75.75 0 1 0 1.06 1.06l-1.06-1.06Zm-4.95 1.768a.75.75 0 0 0 1.06-1.06l-1.06 1.06Zm-2.475-1.414a.75.75 0 1 0-1.06-1.06l1.06 1.06Zm4.95-1.768a.75.75 0 1 0-1.06 1.06l1.06-1.06Zm3.359.53-.884.884 1.06 1.06.885-.883-1.061-1.06Zm-4.95-2.12 1.414-1.415L12 6.344l-1.415 1.413 1.061 1.061Zm0 3.535a2.5 2.5 0 0 1 0-3.536l-1.06-1.06a4 4 0 0 0 0 5.656l1.06-1.06Zm4.95-4.95a2.5 2.5 0 0 1 0 3.535L17.656 12a4 4 0 0 0 0-5.657l-1.06 1.06Zm1.06-1.06a4 4 0 0 0-5.656 0l1.06 1.06a2.5 2.5 0 0 1 3.536 0l1.06-1.06Zm-7.07 7.07.176.177 1.06-1.06-.176-.177-1.06 1.06Zm-3.183-.353.884-.884-1.06-1.06-.884.883 1.06 1.06Zm4.95 2.121-1.414 1.414 1.06 1.06 1.415-1.413-1.06-1.061Zm0-3.536a2.5 2.5 0 0 1 0 3.536l1.06 1.06a4 4 0 0 0 0-5.656l-1.06 1.06Zm-4.95 4.95a2.5 2.5 0 0 1 0-3.535L6.344 12a4 4 0 0 0 0 5.656l1.06-1.06Zm-1.06 1.06a4 4 0 0 0 5.657 0l-1.061-1.06a2.5 2.5 0 0 1-3.535 0l-1.061 1.06Zm7.07-7.07-.176-.177-1.06 1.06.176.178 1.06-1.061Z"
        fill="currentColor"
      />
    </svg>
  )
}

type CategoryFilter = 'all' | 'work' | 'personal'

export function ProjectList({ projects }: { projects: ProjectWithSlug[] }) {
  let [category, setCategory] = useState<CategoryFilter>('all')

  let filtered =
    category === 'all'
      ? projects
      : projects.filter((p) => p.category === category)

  return (
    <>
      <div className="mb-8 flex gap-2">
        {(['all', 'work', 'personal'] as const).map((cat) => (
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
            {cat === 'all' ? 'All' : cat === 'work' ? 'Work' : 'Personal'}
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
                <Card.Title href={`/projects/${project.slug}`}>
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
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <Card.Cta>Read more</Card.Cta>
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
