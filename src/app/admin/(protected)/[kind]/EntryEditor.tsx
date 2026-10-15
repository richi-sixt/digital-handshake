'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import clsx from 'clsx'

import { KIND_LABELS } from '@/app/admin/(protected)/[kind]/kinds'
import { deleteEntry, saveEntry } from '@/app/admin/actions'
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
import { type EntryKind, type EntryRow } from '@/lib/entries'
import { type EntryInput } from '@/lib/entry-input'
import { slugify } from '@/lib/post-input'
import { createClient } from '@/lib/supabase/client'

interface FormState {
  slug: string
  status: 'draft' | 'published'
  organization: string
  location: string
  field: string
  start_year: string
  end_year: string
  tech: string
  related_apps: string[]
  logo_url: string
  show_on_home: boolean
  title_en: string
  title_de: string
  description_en: string
  description_de: string
  body_en: string
  body_de: string
}

function toForm(entry: EntryRow | null): FormState {
  return {
    slug: entry?.slug ?? '',
    status: entry?.status ?? 'draft',
    organization: entry?.organization ?? '',
    location: entry?.location ?? '',
    field: entry?.field ?? '',
    start_year: entry ? String(entry.start_year) : '',
    end_year: entry?.end_year ? String(entry.end_year) : '',
    tech: csv(entry?.tech ?? []),
    related_apps: entry?.related_apps ?? [],
    logo_url: entry?.logo_url ?? '',
    show_on_home: entry?.show_on_home ?? false,
    title_en: entry?.title_en ?? '',
    title_de: entry?.title_de ?? '',
    description_en: entry?.description_en ?? '',
    description_de: entry?.description_de ?? '',
    body_en: entry?.body_en ?? '',
    body_de: entry?.body_de ?? '',
  }
}

export function EntryEditor({
  kind,
  initial,
  apps,
}: {
  kind: EntryKind
  initial: EntryRow | null
  apps: { slug: string; title: string }[]
}) {
  let router = useRouter()
  let labels = KIND_LABELS[kind]
  let draftKey = `entry-draft:${kind}:${initial?.id ?? 'new'}`

  let [id, setId] = useState(initial?.id)
  let [form, setForm] = useState<FormState>(() => toForm(initial))
  let [slugTouched, setSlugTouched] = useState(Boolean(initial))
  let [lang, setLang] = useState<Lang>('en')
  let [busy, setBusy] = useState(false)
  let [uploadingLogo, setUploadingLogo] = useState(false)
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
    let input: EntryInput = {
      id,
      kind,
      slug: next.slug,
      status,
      organization: next.organization,
      location: next.location,
      field: next.field,
      title_en: next.title_en,
      title_de: next.title_de,
      description_en: next.description_en,
      description_de: next.description_de,
      body_en: next.body_en,
      body_de: next.body_de,
      start_year: Number(next.start_year),
      end_year: next.end_year.trim() ? Number(next.end_year) : null,
      tech: parseCsv(next.tech),
      related_apps: next.related_apps,
      logo_url: next.logo_url,
      show_on_home: next.show_on_home,
    }

    let result = await saveEntry(input)
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
      router.replace(`/admin/${kind}/${result.id}`)
    }
  }

  async function remove() {
    if (!id || !confirm('Eintrag endgültig löschen?')) return
    setBusy(true)
    let result = await deleteEntry(id)
    if (!result.ok) {
      setBusy(false)
      setNotice({ kind: 'error', text: result.error ?? 'Löschen fehlgeschlagen.' })
      return
    }
    setSaved(JSON.stringify(form))
    backup.clear()
    router.push(`/admin/${kind}`)
  }

  async function uploadLogo(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return
    setUploadingLogo(true)
    setNotice(undefined)

    let supabase = createClient()
    let ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    let base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'logo'
    let path = `logos/${crypto.randomUUID().slice(0, 8)}-${base}.${ext}`

    let { error } = await supabase.storage
      .from('blog-images')
      .upload(path, file, { contentType: file.type, upsert: false })
    setUploadingLogo(false)

    if (error) {
      setNotice({ kind: 'error', text: `Upload fehlgeschlagen: ${error.message}` })
      return
    }
    let { data } = supabase.storage.from('blog-images').getPublicUrl(path)
    update('logo_url', data.publicUrl)
  }

  function toggleApp(slug: string) {
    update(
      'related_apps',
      form.related_apps.includes(slug)
        ? form.related_apps.filter((s) => s !== slug)
        : [...form.related_apps, slug],
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          {id ? `${labels.singular} bearbeiten` : `Neuer ${labels.singular}`}
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
          {labels.organization}
          <input
            className={inputClass}
            value={form.organization}
            onChange={(e) => {
              update('organization', e.target.value)
              if (!slugTouched) update('slug', slugify(e.target.value))
            }}
          />
        </label>
        <label className={labelClass}>
          Slug (URL)
          <input
            className={inputClass}
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true)
              update('slug', e.target.value)
            }}
            placeholder="die-mobiliar"
          />
        </label>
        <label className={labelClass}>
          Ort
          <input
            className={inputClass}
            value={form.location}
            onChange={(e) => update('location', e.target.value)}
          />
        </label>
        <label className={labelClass}>
          Startjahr
          <input
            type="number"
            inputMode="numeric"
            className={inputClass}
            value={form.start_year}
            onChange={(e) => update('start_year', e.target.value)}
            placeholder="2013"
          />
        </label>
        <label className={labelClass}>
          Endjahr (leer = Heute)
          <input
            type="number"
            inputMode="numeric"
            className={inputClass}
            value={form.end_year}
            onChange={(e) => update('end_year', e.target.value)}
          />
        </label>
        {kind === 'education' && (
          <label className={labelClass}>
            Fachrichtung
            <input
              className={inputClass}
              value={form.field}
              onChange={(e) => update('field', e.target.value)}
            />
          </label>
        )}
        <label className={clsx(labelClass, 'lg:col-span-2')}>
          Tech (Komma-getrennt)
          <input
            className={inputClass}
            value={form.tech}
            onChange={(e) => update('tech', e.target.value)}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={form.show_on_home}
            onChange={(e) => update('show_on_home', e.target.checked)}
          />
          Auf Startseite anzeigen
        </label>

        <div className="flex items-center gap-3">
          {form.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.logo_url}
              alt=""
              className="h-10 w-10 rounded-full bg-white object-contain p-1 ring-1 ring-zinc-200 dark:ring-zinc-700"
            />
          ) : (
            <span className="text-xs text-zinc-500">Kein Logo</span>
          )}
          <label className="cursor-pointer text-xs text-violet-500 hover:text-violet-600">
            {uploadingLogo ? 'Lade hoch …' : 'Logo hochladen'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                uploadLogo(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </label>
          {form.logo_url && (
            <button
              type="button"
              className="text-xs text-zinc-500 underline"
              onClick={() => update('logo_url', '')}
            >
              Entfernen
            </button>
          )}
        </div>
      </div>

      {kind === 'work' && (
        <fieldset className="mt-6">
          <legend className={labelClass}>
            Projekte bei dieser Firma (erscheinen auf der Detailseite)
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {apps.map((app) => {
              let active = form.related_apps.includes(app.slug)
              return (
                <button
                  key={app.slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleApp(app.slug)}
                  className={clsx(
                    'rounded-full px-3 py-1 text-xs font-medium transition',
                    active
                      ? 'bg-violet-500 text-white'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700',
                  )}
                >
                  {app.title}
                </button>
              )
            })}
          </div>
        </fieldset>
      )}

      <LangTabs lang={lang} onChange={setLang} />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          {labels.title} ({lang.toUpperCase()})
          <input
            className={inputClass}
            value={form[titleKey]}
            onChange={(e) => update(titleKey, e.target.value)}
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
            href={`/${kind}/${form.slug}/`}
            target="_blank"
            className="text-sm text-violet-500 hover:text-violet-600"
          >
            Ansehen ↗
          </Link>
        )}
        <Link
          href={`/admin/${kind}`}
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
