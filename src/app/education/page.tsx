import { type Metadata } from 'next'

import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { type EducationWithSlug, getAllEducation } from '@/lib/education'

function EducationEntry({ education }: { education: EducationWithSlug }) {
  let description = [education.degree, education.field]
    .filter(Boolean)
    .join(' — ')

  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        <Card.Title href={`/education/${education.slug}`}>
          {education.institution}
        </Card.Title>
        <Card.Eyebrow
          as="time"
          dateTime={education.date}
          className="md:hidden"
          decorate
        >
          {education.period}
        </Card.Eyebrow>
        <Card.Description>{description}</Card.Description>
        {education.tech && education.tech.length > 0 && (
          <div className="relative z-10 mt-4 flex flex-wrap gap-1">
            {education.tech.map((t) => (
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
        dateTime={education.date}
        className="mt-1 max-md:hidden"
      >
        {education.period}
      </Card.Eyebrow>
    </article>
  )
}

export const metadata: Metadata = {
  title: 'Education',
  description:
    'My educational background and professional certifications.',
}

export default async function EducationIndex() {
  let educations = await getAllEducation()

  return (
    <SimpleLayout
      title="Education & Training"
      intro="My academic journey and professional certifications."
    >
      <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
        <div className="flex max-w-3xl flex-col space-y-16">
          {educations.map((education) => (
            <EducationEntry key={education.slug} education={education} />
          ))}
        </div>
      </div>
    </SimpleLayout>
  )
}
