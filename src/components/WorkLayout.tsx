'use client'

import { useContext } from 'react'
import { useRouter } from 'next/navigation'

import Link from 'next/link'

import { AppContext } from '@/app/providers'
import { Container } from '@/components/Container'
import { Prose } from '@/components/Prose'
import { useTranslation } from '@/i18n'
import { type WorkWithSlug } from '@/lib/work'

const PLAYGROUND_BASE = 'https://playground.sixt.services'

function ArrowLeftIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7.25 11.25 3.75 8m0 0 3.5-3.25M3.75 8h8.5"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function WorkLayout({
  work,
  children,
}: {
  work: WorkWithSlug
  children: React.ReactNode
}) {
  let router = useRouter()
  let { previousPathname } = useContext(AppContext)
  let { t } = useTranslation()

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="xl:relative">
        <div className="mx-auto max-w-2xl">
          {previousPathname && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back to work"
              className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 transition lg:absolute lg:-left-5 lg:-mt-2 lg:mb-0 xl:-top-1.5 xl:left-0 xl:mt-0 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
            >
              <ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
            </button>
          )}
          <article>
            <header className="flex flex-col">
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
                {work.company}
              </h1>
              <div className="order-first flex items-center text-base text-zinc-400 dark:text-zinc-500">
                <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                <span className="ml-3">{work.period}</span>
              </div>
              <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                {work.title} &middot; {work.location}
              </p>
              {work.tech && work.tech.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {work.tech.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              {work.relatedProjects && work.relatedProjects.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                  {work.relatedProjects.map((projectSlug) => (
                    <Link
                      key={projectSlug}
                      href={`${PLAYGROUND_BASE}/apps/${projectSlug}/`}
                      className="text-sm font-medium text-violet-500 hover:text-violet-600"
                    >
                      {t('nav.projects')}: {projectSlug}
                    </Link>
                  ))}
                </div>
              )}
            </header>
            <Prose className="mt-8" data-mdx-content>
              {children}
            </Prose>
          </article>
        </div>
      </div>
    </Container>
  )
}
