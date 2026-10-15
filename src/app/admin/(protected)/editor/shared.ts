export type Lang = 'en' | 'de'

export const inputClass =
  'mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100'
export const labelClass = 'text-xs font-medium text-zinc-600 dark:text-zinc-400'

export const csv = (items: string[]) => items.join(', ')
export const parseCsv = (text: string) =>
  text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

export type Notice = { kind: 'ok' | 'error'; text: string } | undefined
