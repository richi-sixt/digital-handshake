import { type Metadata } from 'next'

import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { type WorkWithSlug, getAllWork } from '@/lib/work'

function WorkEntry({ work }: { work: WorkWithSlug }) {
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
          {work.period}
        </Card.Eyebrow>
        <Card.Description>{work.description}</Card.Description>
        {work.tech && work.tech.length > 0 && (
          <div className="relative z-10 mt-4 flex flex-wrap gap-1">
            {work.tech.map((t) => (
              <span
                key={t}
                className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <Card.Cta>Read more</Card.Cta>
      </Card>
      <Card.Eyebrow
        as="time"
        dateTime={work.date}
        className="mt-1 max-md:hidden"
      >
        {work.period}
      </Card.Eyebrow>
    </article>
  )
}

export const metadata: Metadata = {
  title: 'Work',
  description:
    'My professional experience in insurance, consulting, and IT.',
}

export default async function WorkIndex() {
  let works = await getAllWork()

  return (
    <SimpleLayout
      title="Work Experience"
      intro="My professional journey from IT administration through consulting to insurance process leadership."
    >
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
