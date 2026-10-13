'use client'

import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { useTranslation } from '@/i18n'
import { te } from '@/lib/translatedEntry'
import { type WorkWithSlug } from '@/lib/work'

function WorkEntry({ work }: { work: WorkWithSlug }) {
  let { t } = useTranslation()

  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        <Card.Title href={`/work/${work.slug}`}>
          {work.company}
        </Card.Title>
        <Card.Eyebrow
          as="time"
          dateTime={work.date}
          className="md:hidden"
          decorate
        >
          {te(t, `work.${work.slug}.period`, work.period)}
        </Card.Eyebrow>
        <Card.Description>{te(t, `work.${work.slug}.description`, work.description)}</Card.Description>
        {work.tech && work.tech.length > 0 && (
          <div className="relative z-10 mt-4 flex flex-wrap gap-1">
            {work.tech.map((tech) => (
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
        dateTime={work.date}
        className="mt-1 max-md:hidden"
      >
        {te(t, `work.${work.slug}.period`, work.period)}
      </Card.Eyebrow>
    </article>
  )
}

export function WorkPageContent({ works }: { works: WorkWithSlug[] }) {
  let { t } = useTranslation()

  return (
    <SimpleLayout title={t('work.title')} intro={t('work.intro')}>
      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-16">
          {works.map((work) => (
            <WorkEntry key={work.slug} work={work} />
          ))}
        </div>
      </div>
    </SimpleLayout>
  )
}
