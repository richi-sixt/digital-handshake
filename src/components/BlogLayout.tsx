
'use client'

import { useContext } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { AppContext } from '@/app/providers'
import { Container } from '@/components/Container'
import { Prose } from '@/components/Prose'
import { useTranslation } from '@/i18n'
import { formatDate } from '@/lib/formatDate'
import { type BlogEntryWithSlug } from '@/lib/blog'

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

export function BlogLayout({
  entry,
  children,
}: {
  entry: BlogEntryWithSlug
  children: React.ReactNode
}) {
  let router = useRouter()
  let { previousPathname } = useContext(AppContext)
  let { t, locale } = useTranslation()

  return (
    <Container className="mt-16 lg:mt-32">
      <div className="xl:relative">
        <div className="mx-auto max-w-2xl">
          {previousPathname && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 transition lg:absolute lg:-left-5 lg:-mt-2 lg:mb-0 xl:-top-1.5 xl:left-0 xl:mt-0 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
            >
              <ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
            </button>
          )}
          <article>
            <header className="flex flex-col">
              <time
                dateTime={entry.date}
                className="flex items-center text-base text-zinc-400 dark:text-zinc-500"
              >
                <span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
                <span className="ml-3">{formatDate(entry.date, locale)}</span>
              </time>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
                {locale === 'de' && entry.titleDe ? entry.titleDe : entry.title}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                  {entry.category}
                </span>
                {entry.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {((entry.relatedApps && entry.relatedApps.length > 0) ||
                (entry.relatedWork && entry.relatedWork.length > 0)) && (
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                  {entry.relatedApps?.map((appSlug) => (
                    <Link
                      key={appSlug}
                      href={`/apps/${appSlug}/`}
                      className="text-sm font-medium text-violet-500 hover:text-violet-600"
                    >
                      → {appSlug}
                    </Link>
                  ))}
                  {entry.relatedWork?.map((workSlug) => (
                    <Link
                      key={workSlug}
                      href={`/work/${workSlug}/`}
                      className="text-sm font-medium text-violet-500 hover:text-violet-600"
                    >
                      → {workSlug}
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
