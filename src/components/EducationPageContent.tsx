'use client'

import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { useTranslation } from '@/i18n'
import { te } from '@/lib/translatedEntry'
import { type EducationWithSlug } from '@/lib/education'

function EducationEntry({ education }: { education: EducationWithSlug }) {
  let { t } = useTranslation()
  let description = [
    te(t, `education.${education.slug}.degree`, education.degree),
    education.field ? te(t, `education.${education.slug}.field`, education.field) : null,
  ]
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
          {te(t, `education.${education.slug}.period`, education.period)}
        </Card.Eyebrow>
        <Card.Description>{te(t, `education.${education.slug}.description`, education.description)}</Card.Description>
        {education.tech && education.tech.length > 0 && (
          <div className="relative z-10 mt-4 flex flex-wrap gap-1">
            {education.tech.map((tech) => (
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
        dateTime={education.date}
        className="mt-1 max-md:hidden"
      >
        {te(t, `education.${education.slug}.period`, education.period)}
      </Card.Eyebrow>
    </article>
  )
}

export function EducationPageContent({
  educations,
}: {
  educations: EducationWithSlug[]
}) {
  let { t } = useTranslation()

  return (
    <SimpleLayout
      title={t('education.title')}
      intro={t('education.intro')}
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
