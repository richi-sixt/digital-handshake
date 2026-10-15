'use client'

import Image, { type StaticImageData } from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { GitHubIcon, LinkedInIcon } from '@/components/SocialIcons'
import { useTranslation } from '@/i18n'
import { type EntrySummary } from '@/lib/entries'
import { entryTitle } from '@/lib/entry-format'
import iconIreb from '@/images/skills/ireb.svg'
import iconScrum from '@/images/skills/scrum.svg'
import iconSAFe from '@/images/skills/safe.svg'
import iconPython from '@/images/skills/python.svg'
import iconJavascript from '@/images/skills/javascript.svg'
import iconTypescript from '@/images/skills/typescript.svg'
import iconReact from '@/images/skills/react.svg'
import iconGit from '@/images/skills/git.svg'
import iconNodejs from '@/images/skills/nodedotjs.svg'
import iconVite from '@/images/skills/vite.svg'
import iconNextjs from '@/images/skills/next-js-dark.svg'

function BriefcaseIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M2.75 9.75a3 3 0 0 1 3-3h12.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3H5.75a3 3 0 0 1-3-3v-8.5Z"
        className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500"
      />
      <path
        d="M3 14.25h6.249c.484 0 .952-.002 1.316.319l.777.682a.996.996 0 0 0 1.316 0l.777-.682c.364-.32.832-.319 1.316-.319H21M8.75 6.5V4.75a2 2 0 0 1 2-2h2.5a2 2 0 0 1 2 2V6.5"
        className="stroke-zinc-400 dark:stroke-zinc-500"
      />
    </svg>
  )
}

function AcademicCapIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15v-3.75m0 0h-.008v.008H6.75v-.008Z"
        className="fill-zinc-100 stroke-zinc-400 dark:fill-zinc-100/10 dark:stroke-zinc-500"
      />
    </svg>
  )
}

function SocialLink({
  icon: Icon,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link> & {
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Link className="group -m-1 p-1" {...props}>
      <Icon className="h-6 w-6 fill-violet-500 transition group-hover:fill-violet-600 dark:fill-violet-400 dark:group-hover:fill-violet-500" />
    </Link>
  )
}

/** One row of the Work/Education boxes (same markup for both). */
function HomeEntry({
  entry,
  kind,
}: {
  entry: EntrySummary
  kind: 'work' | 'education'
}) {
  let { t, locale } = useTranslation()
  let startLabel = String(entry.start_year)
  let endLabel =
    entry.end_year === null ? t('home.present') : String(entry.end_year)
  let endDate = String(entry.end_year ?? new Date().getFullYear())
  let Fallback = kind === 'work' ? BriefcaseIcon : AcademicCapIcon

  return (
    <li className="flex gap-4">
      <div className="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
        {entry.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.logo_url} alt="" className="h-7 w-7 object-contain" />
        ) : (
          <Fallback className="h-7 w-7" />
        )}
      </div>
      <dl className="flex flex-auto flex-wrap gap-x-2">
        <dt className="sr-only">
          {t(kind === 'work' ? 'sr.company' : 'sr.institution')}
        </dt>
        <dd className="w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100">
          <Link href={`/${kind}/${entry.slug}/`} className="hover:text-violet-500">
            {entry.organization}
          </Link>
        </dd>
        <dt className="sr-only">
          {t(kind === 'work' ? 'sr.role' : 'sr.degree')}
        </dt>
        <dd className="text-xs text-zinc-500 dark:text-zinc-400">
          {entryTitle(entry, locale)}
        </dd>
        <dt className="sr-only">{t('sr.date')}</dt>
        <dd
          className="ml-auto text-xs text-zinc-400 dark:text-zinc-500"
          aria-label={t('sr.dateUntil', { start: startLabel, end: endLabel })}
        >
          <time dateTime={startLabel}>{startLabel}</time>{' '}
          <span aria-hidden="true">&mdash;</span>{' '}
          <time dateTime={endDate}>{endLabel}</time>
        </dd>
      </dl>
    </li>
  )
}

function Resume({ entries }: { entries: EntrySummary[] }) {
  let { t } = useTranslation()

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <BriefcaseIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">{t('home.work')}</span>
      </h2>
      <ol className="mt-6 space-y-4">
        {entries.map((entry) => (
          <HomeEntry key={entry.id} entry={entry} kind="work" />
        ))}
      </ol>
      <Button href="/work" variant="secondary" className="group mt-6 w-full">
        {t('home.viewAllPositions')}
      </Button>
    </div>
  )
}

interface Skill {
  name: string
  icon: string | StaticImageData
  url: string
}

interface SkillCategory {
  title: string
  skills: Skill[]
}

function useSkillCategories(): SkillCategory[] {
  let { t } = useTranslation()
  return [
    {
      title: t('home.methodicalSkills'),
      skills: [
        { name: 'IREB', icon: iconIreb, url: 'https://www.ireb.org/' },
        { name: 'Scrum', icon: iconScrum, url: 'https://www.scrum.org/' },
        { name: 'SAFe', icon: iconSAFe, url: 'https://scaledagileframework.com/' },
      ],
    },
    {
      title: t('home.technicalSkills'),
      skills: [
        { name: 'Python', icon: iconPython, url: 'https://www.python.org/' },
        { name: 'JavaScript', icon: iconJavascript, url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
        { name: 'TypeScript', icon: iconTypescript, url: 'https://www.typescriptlang.org/' },
        { name: 'React', icon: iconReact, url: 'https://react.dev/' },
        { name: 'Git', icon: iconGit, url: 'https://git-scm.com/' },
        { name: 'Node.js', icon: iconNodejs, url: 'https://nodejs.org/' },
        { name: 'Vite', icon: iconVite, url: 'https://vite.dev/' },
        { name: 'Next.js', icon: iconNextjs, url: 'https://nextjs.org/' },
      ],
    },
  ]
}

function EducationPreview({ entries }: { entries: EntrySummary[] }) {
  let { t } = useTranslation()

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <AcademicCapIcon className="h-6 w-6 flex-none" />
        <span className="ml-3">{t('home.education')}</span>
      </h2>
      <ol className="mt-6 space-y-4">
        {entries.map((entry) => (
          <HomeEntry key={entry.id} entry={entry} kind="education" />
        ))}
      </ol>
      <Button href="/education" variant="secondary" className="group mt-6 w-full">
        {t('home.viewAllEducation')}
      </Button>
    </div>
  )
}

export function HomeContent({
  work,
  education,
}: {
  work: EntrySummary[]
  education: EntrySummary[]
}) {
  let { t } = useTranslation()
  let skillCategories = useSkillCategories()

  return (
    <>
      {/* Hero */}
      <section id="hero">
        <Container className="mt-9">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
              R&uuml;chan Sixt
            </h1>
            <p className="mt-6 text-base text-zinc-600 dark:text-zinc-400">
              {t('home.subtitle')}
            </p>
            <div className="mt-6 flex gap-6">
              <SocialLink
                href="https://github.com/richi-sixt"
                aria-label="Follow on GitHub"
                icon={GitHubIcon}
              />
              <SocialLink
                href="https://www.linkedin.com/in/r%C3%BCchan-sixt/"
                aria-label="Follow on LinkedIn"
                icon={LinkedInIcon}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* About */}
      <section id="about">
        <Container className="mt-24 md:mt-28">
          <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-800 sm:text-4xl dark:text-zinc-100">
                {t('home.aboutMe')}
              </h2>
              <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
                <p>{t('home.aboutP1')}</p>
                <p>{t('home.aboutP2')}</p>
              </div>
            </div>
            <div className="lg:pl-16 xl:pl-24">
              <Resume entries={work} />
            </div>
          </div>
        </Container>
      </section>

      {/* Skills & Education */}
      <section id="skills">
        <Container className="mt-24 md:mt-28">
          <div className="mx-auto grid max-w-xl grid-cols-1 gap-y-20 lg:max-w-none lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-800 sm:text-4xl dark:text-zinc-100">
                {t('home.skillsAndTech')}
              </h2>
              {skillCategories.map((category) => (
                <div key={category.title}>
                  <h3 className="mt-8 text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                    {category.title}
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
                    {category.skills.map((skill) => (
                      <Link
                        href={skill.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={skill.name}
                        className="flex items-center gap-3 rounded-xl border border-zinc-100 p-4 transition hover:bg-zinc-50 dark:border-zinc-700/40 dark:hover:bg-zinc-800/50"
                      >
                        {typeof skill.icon === 'string' ? (
                          <span className="text-2xl">{skill.icon}</span>
                        ) : (
                          <Image
                            src={skill.icon}
                            alt={skill.name}
                            className="h-7 w-7"
                            unoptimized
                          />
                        )}
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {skill.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:pl-16 xl:pl-24">
              <EducationPreview entries={education} />
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
