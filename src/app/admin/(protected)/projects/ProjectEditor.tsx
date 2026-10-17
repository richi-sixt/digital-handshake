'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import clsx from 'clsx'

import { deleteProject, saveProject } from '@/app/admin/actions'
import { LangTabs } from '@/app/admin/(protected)/editor/LangTabs'
import { MarkdownPane } from '@/app/admin/(protected)/editor/MarkdownPane'
import {
  type Lang,
  type Notice,
  csv,
  inputClass,
  labelClass,
  parseCsv,
} from '@/app/admin/(protected)/editor/shared'
import {
  RestoreBanner,
  useFormBackup,
} from '@/app/admin/(protected)/editor/useFormBackup'
import { slugify } from '@/lib/post-input'
import { type ProjectInput } from '@/lib/project-input'
import { type ProjectCategory, type ProjectRow } from '@/lib/projects'

const CATEGORIES: { value: ProjectCategory; label: string }[] = [
  { value: 'games', label: 'Games' },
  { value: 'tools', label: 'Tools' },
  { value: 'web', label: 'Web' },
  { value: 'misc', label: 'Sonstiges' },
]

const today = () => new Date().toISOString().slice(0, 10)

interface FormState {
  slug: string
  status: 'draft' | 'published'
  date: string
  category: ProjectCategory
  tech: string
  url: string
  github: string
  title_en: string
  title_de: string
  description_en: string
  description_de: string
  body_en: string
  body_de: string
}

function toForm(project: ProjectRow | null): FormState {
  return {
    slug: project?.slug ?? '',
    status: project?.status ?? 'draft',
    date: project?.date ?? today(),
    category: project?.category ?? 'web',
    tech: csv(project?.tech ?? []),
    url: project?.url ?? '',
    github: project?.github ?? '',
    title_en: project?.title_en ?? '',
    title_de: project?.title_de ?? '',
    description_en: project?.description_en ?? '',
    description_de: project?.description_de ?? '',
    body_en: project?.body_en ?? '',
    body_de: project?.body_de ?? '',
  }
}

export function ProjectEditor({ initial }: { initial: ProjectRow | null }) {
  let router = useRouter()
  let draftKey = `project-draft:${initial?.id ?? 'new'}`

  let [id, setId] = useState(initial?.id)
  let [form, setForm] = useState<FormState>(() => toForm(initial))
  let [slugTouched, setSlugTouched] = useState(Boolean(initial))
  let [lang, setLang] = useState<Lang>('en')
  let [busy, setBusy] = useState(false)
  let [notice, setNotice] = useState<Notice>()
  let [saved, setSaved] = useState(() => JSON.stringify(toForm(initial)))

  let dirty = JSON.stringify(form) !== saved
  let bodyKey: 'body_en' | 'body_de' = lang === 'en' ? 'body_en' : 'body_de'
  let titleKey: 'title_en' | 'title_de' =
    lang === 'en' ? 'title_en' : 'title_de'
  let descKey: 'description_en' | 'description_de' =
    lang === 'en' ? 'description_en' : 'description_de'

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  let backup = useFormBackup<FormState>({
    draftKey,
    form,
    saved,
    dirty,
    onRestore: (restored) => {
      setForm(restored)
      setSlugTouched(true)
    },
  })

  async function save(status: FormState['status']) {
    setBusy(true)
    setNotice(undefined)

    let next = { ...form, status }
    let input: ProjectInput = {
      id,
      slug: next.slug,
      status,
      title_en: next.title_en,
      title_de: next.title_de,
      description_en: next.description_en,
      description_de: next.description_de,
      body_en: next.body_en,
      body_de: next.body_de,
      tech: parseCsv(next.tech),
      url: next.url,
      github: next.github,
      date: next.date,
      category: next.category,
    }

    let result = await saveProject(input)
    setBusy(false)

    if (!result.ok) {
      setNotice({ kind: 'error', text: result.error })
      return
    }

    setForm(next)
    setSaved(JSON.stringify(next))
    backup.clear()
    setNotice({
      kind: 'ok',
      text: status === 'published' ? 'Veröffentlicht.' : 'Gespeichert.',
    })

    if (!id) {
      setId(result.id)
      router.replace(`/admin/projects/${result.id}`)
    }
  }

  async function remove() {
    if (!id || !confirm('Projekt endgültig löschen?')) return
    setBusy(true)
    let result = await deleteProject(id)
    if (!result.ok) {
      setBusy(false)
      setNotice({ kind: 'error', text: result.error ?? 'Löschen fehlgeschlagen.' })
      return
    }
    setSaved(JSON.stringify(form))
    backup.clear()
    router.push('/admin/projects')
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          {id ? 'Projekt bearbeiten' : 'Neues Projekt'}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={clsx(
              'rounded-full px-2 py-0.5 text-xs',
              form.status === 'published'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
            )}
          >
            {form.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
          </span>
          {dirty && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Ungespeicherte Änderungen
            </span>
          )}
        </div>
      </div>

      {backup.restorable && (
        <RestoreBanner onRestore={backup.restore} onDiscard={backup.discard} />
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className={clsx(labelClass, 'lg:col-span-2')}>
          Slug (URL)
          <input
            className={inputClass}
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true)
              update('slug', e.target.value)
            }}
            placeholder="mein-projekt"
          />
        </label>
        <label className={labelClass}>
          Datum
          <input
            type="date"
            className={inputClass}
            value={form.date}
            onChange={(e) => update('date', e.target.value)}
          />
        </label>
        <label className={labelClass}>
          Kategorie
          <select
            className={inputClass}
            value={form.category}
            onChange={(e) => update('category', e.target.value as ProjectCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className={clsx(labelClass, 'lg:col-span-2')}>
          Tech (Komma-getrennt)
          <input
            className={inputClass}
            value={form.tech}
            onChange={(e) => update('tech', e.target.value)}
          />
        </label>
        <label className={labelClass}>
          App-Link (z. B. /apps/uno/play/ oder https://…)
          <input
            className={inputClass}
            value={form.url}
            onChange={(e) => update('url', e.target.value)}
          />
        </label>
        <label className={labelClass}>
          GitHub-URL
          <input
            className={inputClass}
            value={form.github}
            onChange={(e) => update('github', e.target.value)}
            placeholder="https://github.com/…"
          />
        </label>
      </div>

      <LangTabs lang={lang} onChange={setLang} />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Titel ({lang.toUpperCase()})
          <input
            className={inputClass}
            value={form[titleKey]}
            onChange={(e) => {
              update(titleKey, e.target.value)
              if (lang === 'en' && !slugTouched) {
                update('slug', slugify(e.target.value))
              }
            }}
          />
        </label>
        <label className={labelClass}>
          Beschreibung ({lang.toUpperCase()})
          <input
            className={inputClass}
            value={form[descKey]}
            onChange={(e) => update(descKey, e.target.value)}
          />
        </label>
      </div>

      <MarkdownPane
        value={form[bodyKey]}
        onChange={(value) => update(bodyKey, value)}
        lang={lang}
        onError={(text) => setNotice({ kind: 'error', text })}
      />

      {notice && (
        <p
          role="status"
          className={clsx(
            'mt-4 rounded-lg p-3 text-sm',
            notice.kind === 'ok'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
              : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
          )}
        >
          {notice.text}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => save(form.status)}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-200 dark:text-zinc-900"
        >
          Speichern
        </button>
        {form.status === 'draft' ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => save('published')}
            className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-60"
          >
            Veröffentlichen
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => save('draft')}
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 disabled:opacity-60 dark:bg-zinc-800 dark:text-zinc-300"
          >
            Zurück in Entwurf
          </button>
        )}
        {form.status === 'published' && id && (
          <Link
            href={`/apps/${form.slug}/`}
            target="_blank"
            className="text-sm text-violet-500 hover:text-violet-600"
          >
            Ansehen ↗
          </Link>
        )}
        <Link
          href="/admin/projects"
          className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
        >
          Zur Liste
        </Link>
        {id && (
          <button
            type="button"
            disabled={busy}
            onClick={remove}
            className="ml-auto text-sm text-red-600 hover:text-red-700 disabled:opacity-60 dark:text-red-400"
          >
            Löschen
          </button>
        )}
      </div>
    </div>
  )
}
