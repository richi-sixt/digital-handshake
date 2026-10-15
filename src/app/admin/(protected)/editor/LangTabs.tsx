'use client'

import clsx from 'clsx'

import { type Lang } from '@/app/admin/(protected)/editor/shared'

export function LangTabs({
  lang,
  onChange,
}: {
  lang: Lang
  onChange: (lang: Lang) => void
}) {
  return (
    <div className="mt-6 flex gap-2">
      {(['en', 'de'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
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
  )
}
