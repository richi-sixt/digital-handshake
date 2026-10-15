'use client'

import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'
import clsx from 'clsx'

import {
  type Lang,
  labelClass,
} from '@/app/admin/(protected)/editor/shared'
import { slugify } from '@/lib/post-input'
import { createClient } from '@/lib/supabase/client'

const PostPreview = dynamic(
  () => import('@/app/admin/(protected)/editor/PostPreview'),
  {
    ssr: false,
    loading: () => <p className="text-sm text-zinc-400">Lade Vorschau …</p>,
  },
)

/**
 * Markdown textarea with live preview (split on desktop, tabs on mobile) and
 * image upload (button, drag & drop, paste) into the `blog-images` bucket.
 */
export function MarkdownPane({
  value,
  onChange,
  lang,
  onError,
}: {
  value: string
  onChange: (value: string) => void
  lang: Lang
  onError: (message: string) => void
}) {
  let [pane, setPane] = useState<'write' | 'preview'>('write')
  let [uploading, setUploading] = useState(false)
  let textarea = useRef<HTMLTextAreaElement>(null)

  async function uploadImages(files: File[]) {
    let images = files.filter((f) => f.type.startsWith('image/'))
    if (images.length === 0) return

    setUploading(true)
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
        onError(`Upload fehlgeschlagen: ${error.message}`)
        continue
      }
      let { data } = supabase.storage.from('blog-images').getPublicUrl(path)
      markdown.push(`![${base}](${data.publicUrl})`)
    }
    setUploading(false)
    if (markdown.length === 0) return

    let el = textarea.current
    let start = el?.selectionStart ?? value.length
    let end = el?.selectionEnd ?? value.length
    onChange(value.slice(0, start) + markdown.join('\n\n') + value.slice(end))
  }

  return (
    <>
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
            value={value}
            onChange={(e) => onChange(e.target.value)}
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
          <PostPreview markdown={value} />
        </div>
      </div>
    </>
  )
}
