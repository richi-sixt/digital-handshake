'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

import { deletePost, savePost } from '@/app/admin/actions'
import { type PostInput, slugify } from '@/lib/post-input'
import { type PostRow } from '@/lib/posts'
import { createClient } from '@/lib/supabase/client'

const PostPreview = dynamic(
  () => import('@/app/admin/(protected)/posts/PostPreview'),
  {
    ssr: false,
    loading: () => <p className="text-sm text-zinc-400">Lade Vorschau …</p>,
  },
)

type Lang = 'en' | 'de'

const today = () => new Date().toISOString().slice(0, 10)
const csv = (items: string[]) => items.join(', ')
const parseCsv = (text: string) =>
  text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

interface FormState {
  slug: string
  status: 'draft' | 'published'
  date: string
  category: string
  tags: string
  related_apps: string
  related_work: string
  title_en: string
  title_de: string
  description_en: string
  description_de: string
  body_en: string
  body_de: string
}

function toForm(post: PostRow | null): FormState {
  return {
    slug: post?.slug ?? '',
    status: post?.status ?? 'draft',
    date: post?.date ?? today(),
    category: post?.category ?? 'development',
    tags: csv(post?.tags ?? []),
    related_apps: csv(post?.related_apps ?? []),
    related_work: csv(post?.related_work ?? []),
    title_en: post?.title_en ?? '',
    title_de: post?.title_de ?? '',
    description_en: post?.description_en ?? '',
    description_de: post?.description_de ?? '',
    body_en: post?.body_en ?? '',
    body_de: post?.body_de ?? '',
  }
}

const inputClass =
  'mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
const labelClass = 'text-xs font-medium text-zinc-600 dark:text-zinc-400'

export function PostEditor({
  initial,
  categories,
}: {
  initial: PostRow | null
  categories: string[]
}) {
  let router = useRouter()
  let draftKey = `blog-draft:${initial?.id ?? 'new'}`

  let [id, setId] = useState(initial?.id)
  let [form, setForm] = useState<FormState>(() => toForm(initial))
  let [slugTouched, setSlugTouched] = useState(Boolean(initial))
  let [lang, setLang] = useState<Lang>('en')
  let [pane, setPane] = useState<'write' | 'preview'>('write')
  let [busy, setBusy] = useState(false)
  let [uploading, setUploading] = useState(false)
  let [notice, setNotice] = useState<{ kind: 'ok' | 'error'; text: string }>()
  let [restorable, setRestorable] = useState<FormState | null>(null)
  let [saved, setSaved] = useState(() => JSON.stringify(toForm(initial)))
  let textarea = useRef<HTMLTextAreaElement>(null)
  // Snapshot of the form as loaded; used once to detect a stale local backup.
  let savedAtLoad = useRef(saved)

  let dirty = JSON.stringify(form) !== saved
  let bodyKey: 'body_en' | 'body_de' = lang === 'en' ? 'body_en' : 'body_de'
  let titleKey: 'title_en' | 'title_de' =
    lang === 'en' ? 'title_en' : 'title_de'
  let descKey: 'description_en' | 'description_de' =
    lang === 'en' ? 'description_en' : 'description_de'

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  // Local backup of unsaved changes (survives a closed tab or lost session).
  useEffect(() => {
    try {
      let raw = localStorage.getItem(draftKey)
      if (raw && raw !== savedAtLoad.current) setRestorable(JSON.parse(raw))
    } catch {}
  }, [draftKey])

  useEffect(() => {
    if (!dirty) return
    let timer = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(form))
      } catch {}
    }, 800)
    return () => clearTimeout(timer)
  }, [form, dirty, draftKey])

  useEffect(() => {
    if (!dirty) return
    let handler = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  async function save(status: FormState['status']) {
    setBusy(true)
    setNotice(undefined)

    let next = { ...form, status }
    let input: PostInput = {
      id,
      slug: next.slug,
      status,
      date: next.date,
      category: next.category,
      tags: parseCsv(next.tags),
      related_apps: parseCsv(next.related_apps),
      related_work: parseCsv(next.related_work),
      title_en: next.title_en,
      title_de: next.title_de,
      description_en: next.description_en,
      description_de: next.description_de,
      body_en: next.body_en,
      body_de: next.body_de,
    }

    let result = await savePost(input)
    setBusy(false)

    if (!result.ok) {
      setNotice({ kind: 'error', text: result.error })
      return
    }

    setForm(next)
    setSaved(JSON.stringify(next))
    try {
      localStorage.removeItem(draftKey)
    } catch {}
    setNotice({
      kind: 'ok',
      text: status === 'published' ? 'Veröffentlicht.' : 'Gespeichert.',
    })

    if (!id) {
      setId(result.id)
      router.replace(`/admin/posts/${result.id}`)
    }
  }

  async function remove() {
    if (!id || !confirm('Beitrag endgültig löschen?')) return
    setBusy(true)
    let result = await deletePost(id)
    if (!result.ok) {
      setBusy(false)
      setNotice({ kind: 'error', text: result.error ?? 'Löschen fehlgeschlagen.' })
      return
    }
    setSaved(JSON.stringify(form))
    try {
      localStorage.removeItem(draftKey)
    } catch {}
    router.push('/admin')
  }

  async function uploadImages(files: File[]) {
    let images = files.filter((f) => f.type.startsWith('image/'))
    if (images.length === 0) return

    setUploading(true)
    setNotice(undefined)
    let supabase = createClient()
    let markdown: string[] = []

    for (let file of images) {
      let ext = file.name.split('.').pop()?.toLowerCase() || 'png'
      let base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'image'
      let path = `${new Date().getFullYear()}/${crypto.randomUUID().slice(0, 8)}-${base}.${ext}`

      let { error } = await supabase.storage
        .from('blog-images')
        .upload(path, file, { contentType: file.type, upsert: false })

      if (error) {
        setNotice({ kind: 'error', text: `Upload fehlgeschlagen: ${error.message}` })
        continue
      }
      let { data } = supabase.storage.from('blog-images').getPublicUrl(path)
      markdown.push(`![${base}](${data.publicUrl})`)
    }
    setUploading(false)
    if (markdown.length === 0) return

    let el = textarea.current
    let current = form[bodyKey]
    let start = el?.selectionStart ?? current.length
    let end = el?.selectionEnd ?? current.length
    let insert = markdown.join('\n\n')
    update(bodyKey, current.slice(0, start) + insert + current.slice(end))
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
          {id ? 'Beitrag bearbeiten' : 'Neuer Beitrag'}
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

      {restorable && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          Es gibt einen lokal gesicherten, ungespeicherten Entwurf.
          <button
            type="button"
            className="rounded-full bg-amber-200 px-3 py-1 dark:bg-amber-800"
            onClick={() => {
              setForm(restorable)
              setSlugTouched(true)
              setRestorable(null)
            }}
          >
            Wiederherstellen
          </button>
          <button
            type="button"
            className="underline"
            onClick={() => {
              try {
                localStorage.removeItem(draftKey)
              } catch {}
              setRestorable(null)
            }}
          >
            Verwerfen
          </button>
        </div>
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
            placeholder="mein-beitrag"
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
          <input
            className={inputClass}
            list="post-categories"
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
          />
          <datalist id="post-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label className={clsx(labelClass, 'lg:col-span-2')}>
          Tags (Komma-getrennt)
          <input
            className={inputClass}
            value={form.tags}
            onChange={(e) => update('tags', e.target.value)}
          />
        </label>
        <label className={labelClass}>
          Verknüpfte Apps (Slugs)
          <input
            className={inputClass}
            value={form.related_apps}
            onChange={(e) => update('related_apps', e.target.value)}
          />
        </label>
        <label className={labelClass}>
          Verknüpfte Work-Einträge
          <input
            className={inputClass}
            value={form.related_work}
            onChange={(e) => update('related_work', e.target.value)}
          />
        </label>
      </div>

      <div className="mt-6 flex gap-2">
        {(['en', 'de'] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={clsx(
              'rounded-full px-4 py-1.5 text-sm font-medium uppercase transition',
              lang === l
                ? 'bg-violet-500 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700',
            )}
          >
            {l}
          </button>
        ))}
        {lang === 'de' && (
          <span className="self-center text-xs text-zinc-500">
            Leer lassen = Englisch wird angezeigt
          </span>
        )}
      </div>

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

      <div className="mt-4 flex gap-2 lg:hidden">
        {(['write', 'preview'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPane(p)}
            className={clsx(
              'rounded-full px-4 py-1.5 text-sm font-medium transition',
              pane === p
                ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
            )}
          >
            {p === 'write' ? 'Schreiben' : 'Vorschau'}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className={clsx(pane === 'preview' && 'max-lg:hidden')}>
          <div className="mb-1 flex items-center justify-between">
            <span className={labelClass}>
              Markdown ({lang.toUpperCase()}) – Bilder hineinziehen oder
              einfügen
            </span>
            <label className="cursor-pointer text-xs text-violet-500 hover:text-violet-600">
              {uploading ? 'Lade hoch …' : 'Bild hochladen'}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  uploadImages(Array.from(e.target.files ?? []))
                  e.target.value = ''
                }}
              />
            </label>
          </div>
          <textarea
            ref={textarea}
            value={form[bodyKey]}
            onChange={(e) => update(bodyKey, e.target.value)}
            onDrop={(e) => {
              if (e.dataTransfer.files.length > 0) {
                e.preventDefault()
                uploadImages(Array.from(e.dataTransfer.files))
              }
            }}
            onPaste={(e) => {
              let files = Array.from(e.clipboardData.files)
              if (files.length > 0) {
                e.preventDefault()
                uploadImages(files)
              }
            }}
            spellCheck
            className="block min-h-[28rem] w-full rounded-lg border border-zinc-300 bg-white p-3 font-mono text-sm text-zinc-900 lg:min-h-[40rem] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
        </div>
        <div
          className={clsx(
            'min-w-0 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700',
            pane === 'write' && 'max-lg:hidden',
          )}
        >
          <PostPreview markdown={form[bodyKey]} />
        </div>
      </div>

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
            href={`/blog/${form.slug}/`}
            target="_blank"
            className="text-sm text-violet-500 hover:text-violet-600"
          >
            Ansehen ↗
          </Link>
        )}
        <Link
          href="/admin"
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
