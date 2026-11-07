'use client'

import { useState } from 'react'

import {
  type Notice,
  inputClass,
  labelClass,
} from '@/app/admin/(protected)/editor/shared'
import { deleteSkill, reorderSkills, saveSkill } from '@/app/admin/actions'
import { slugify } from '@/lib/post-input'
import {
  SKILL_CATEGORIES,
  type SkillCategory,
  type SkillRow,
} from '@/lib/skills'
import { createClient } from '@/lib/supabase/client'

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  methodical: 'Methodical Skills',
  technical: 'Technical Skills',
}

// A skill that is not saved yet has no id; `key` identifies it in the list.
interface Item {
  key: string
  id?: string
  category: SkillCategory
  name: string
  url: string
  icon_url: string
}

const toItem = (s: SkillRow): Item => ({
  key: s.id,
  id: s.id,
  category: s.category,
  name: s.name,
  url: s.url,
  icon_url: s.icon_url ?? '',
})

export function SkillsEditor({ initial }: { initial: SkillRow[] }) {
  let [items, setItems] = useState<Item[]>(() => initial.map(toItem))
  // Last saved state per key, to show which rows have unsaved changes.
  let [saved, setSaved] = useState<Record<string, string>>(() =>
    Object.fromEntries(initial.map((s) => [s.id, JSON.stringify(toItem(s))])),
  )
  let [busy, setBusy] = useState<string>()
  let [notice, setNotice] = useState<Notice>()

  let isDirty = (item: Item) => saved[item.key] !== JSON.stringify(item)

  function patch(key: string, changes: Partial<Item>) {
    setItems((all) => all.map((i) => (i.key === key ? { ...i, ...changes } : i)))
  }

  function add(category: SkillCategory) {
    setItems((all) => [
      ...all,
      {
        key: crypto.randomUUID(),
        category,
        name: '',
        url: '',
        icon_url: '',
      },
    ])
  }

  async function save(item: Item) {
    setBusy(item.key)
    setNotice(undefined)
    let result = await saveSkill({
      id: item.id,
      category: item.category,
      name: item.name,
      url: item.url,
      icon_url: item.icon_url,
    })
    setBusy(undefined)

    if (!result.ok) {
      setNotice({ kind: 'error', text: result.error })
      return
    }
    let next = { ...item, id: result.id, key: result.id }
    setItems((all) => all.map((i) => (i.key === item.key ? next : i)))
    setSaved((s) => {
      let { [item.key]: _old, ...rest } = s
      return { ...rest, [next.key]: JSON.stringify(next) }
    })
    setNotice({ kind: 'ok', text: `„${next.name}“ gespeichert.` })
  }

  async function remove(item: Item) {
    if (item.id) {
      if (!window.confirm(`„${item.name || 'Skill'}“ wirklich löschen?`)) return
      setBusy(item.key)
      let result = await deleteSkill(item.id)
      setBusy(undefined)
      if (!result.ok) {
        setNotice({ kind: 'error', text: result.error ?? 'Löschen fehlgeschlagen.' })
        return
      }
    }
    setItems((all) => all.filter((i) => i.key !== item.key))
  }

  async function move(item: Item, direction: -1 | 1) {
    let group = items.filter((i) => i.category === item.category)
    let from = group.findIndex((i) => i.key === item.key)
    let to = from + direction
    if (to < 0 || to >= group.length) return

    let reordered = [...group]
    reordered.splice(to, 0, reordered.splice(from, 1)[0])

    // Keep the other category where it is; swap this one's rows in place.
    let queue = [...reordered]
    setItems((all) => all.map((i) => (i.category === item.category ? queue.shift()! : i)))

    let ids = reordered.map((i) => i.id).filter((id): id is string => !!id)
    if (ids.length !== reordered.length) {
      setNotice({
        kind: 'error',
        text: 'Neue Skills zuerst speichern, dann wird die Reihenfolge übernommen.',
      })
      return
    }
    let result = await reorderSkills(ids)
    if (!result.ok) {
      setNotice({ kind: 'error', text: result.error ?? 'Sortieren fehlgeschlagen.' })
    }
  }

  async function uploadIcon(item: Item, file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return
    setBusy(item.key)
    setNotice(undefined)

    let supabase = createClient()
    let ext = file.name.split('.').pop()?.toLowerCase() || 'svg'
    let base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'icon'
    let path = `skills/${crypto.randomUUID().slice(0, 8)}-${base}.${ext}`

    let { error } = await supabase.storage
      .from('blog-images')
      .upload(path, file, { contentType: file.type, upsert: false })
    setBusy(undefined)

    if (error) {
      setNotice({ kind: 'error', text: `Upload fehlgeschlagen: ${error.message}` })
      return
    }
    let { data } = supabase.storage.from('blog-images').getPublicUrl(path)
    patch(item.key, { icon_url: data.publicUrl })
  }

  return (
    <div>
      {notice && (
        <p
          role="status"
          className={
            notice.kind === 'ok'
              ? 'mt-6 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300'
              : 'mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300'
          }
        >
          {notice.text}
        </p>
      )}

      {SKILL_CATEGORIES.map((category) => {
        let group = items.filter((i) => i.category === category)
        return (
          <section key={category} className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                {CATEGORY_LABELS[category]}
              </h2>
              <button
                type="button"
                onClick={() => add(category)}
                className="rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-600"
              >
                Skill hinzufügen
              </button>
            </div>

            <ul className="mt-4 divide-y divide-zinc-100 rounded-xl border border-zinc-100 dark:divide-zinc-700/40 dark:border-zinc-700/40">
              {group.length === 0 && (
                <li className="p-4 text-sm text-zinc-500">Noch keine Skills.</li>
              )}
              {group.map((item, index) => {
                let working = busy === item.key
                return (
                  <li
                    key={item.key}
                    className="grid gap-3 p-4 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.icon_url}
                          alt=""
                          className="h-10 w-10 rounded-lg bg-white object-contain p-1 ring-1 ring-zinc-200 dark:ring-zinc-700"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg text-xs text-zinc-400 ring-1 ring-zinc-200 dark:ring-zinc-700">
                          –
                        </span>
                      )}
                      <div className="flex flex-col gap-1 text-xs">
                        <label className="cursor-pointer text-violet-500 hover:text-violet-600">
                          Icon hochladen
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              uploadIcon(item, e.target.files?.[0])
                              e.target.value = ''
                            }}
                          />
                        </label>
                        {item.icon_url && (
                          <button
                            type="button"
                            className="text-left text-zinc-500 underline"
                            onClick={() => patch(item.key, { icon_url: '' })}
                          >
                            Entfernen
                          </button>
                        )}
                      </div>
                    </div>

                    <label className={labelClass}>
                      Name
                      <input
                        className={inputClass}
                        value={item.name}
                        onChange={(e) => patch(item.key, { name: e.target.value })}
                      />
                    </label>
                    <label className={labelClass}>
                      Link
                      <input
                        className={inputClass}
                        value={item.url}
                        onChange={(e) => patch(item.key, { url: e.target.value })}
                        placeholder="https://"
                      />
                    </label>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <button
                        type="button"
                        aria-label="Nach oben"
                        disabled={index === 0}
                        onClick={() => move(item, -1)}
                        className="rounded-lg bg-zinc-100 px-2 py-1 disabled:opacity-30 dark:bg-zinc-800"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label="Nach unten"
                        disabled={index === group.length - 1}
                        onClick={() => move(item, 1)}
                        className="rounded-lg bg-zinc-100 px-2 py-1 disabled:opacity-30 dark:bg-zinc-800"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        disabled={working || !isDirty(item)}
                        onClick={() => save(item)}
                        className="rounded-lg bg-violet-500 px-3 py-1 font-medium text-white hover:bg-violet-600 disabled:opacity-40"
                      >
                        {working ? '…' : 'Speichern'}
                      </button>
                      <button
                        type="button"
                        disabled={working}
                        onClick={() => remove(item)}
                        className="rounded-lg px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Löschen
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
