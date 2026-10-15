'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Local backup of unsaved form changes (survives a closed tab or lost
 * session) plus a "leave page?" warning while there are unsaved changes.
 * `saved` is the JSON of the last saved form; `dirty` says form differs.
 */
export function useFormBackup<T>({
  draftKey,
  form,
  saved,
  dirty,
  onRestore,
}: {
  draftKey: string
  form: T
  saved: string
  dirty: boolean
  onRestore: (form: T) => void
}) {
  let [restorable, setRestorable] = useState<T | null>(null)
  // Snapshot of the form as loaded; used once to detect a stale local backup.
  let savedAtLoad = useRef(saved)

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

  function clear() {
    try {
      localStorage.removeItem(draftKey)
    } catch {}
  }

  function discard() {
    clear()
    setRestorable(null)
  }

  function restore() {
    if (restorable) onRestore(restorable)
    setRestorable(null)
  }

  return { restorable, restore, discard, clear }
}

export function RestoreBanner({
  onRestore,
  onDiscard,
}: {
  onRestore: () => void
  onDiscard: () => void
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
      Es gibt einen lokal gesicherten, ungespeicherten Entwurf.
      <button
        type="button"
        className="rounded-full bg-amber-200 px-3 py-1 dark:bg-amber-800"
        onClick={onRestore}
      >
        Wiederherstellen
      </button>
      <button type="button" className="underline" onClick={onDiscard}>
        Verwerfen
      </button>
    </div>
  )
}
