import { notFound } from 'next/navigation'

import { type EntryKind } from '@/lib/entries'

export const KIND_LABELS: Record<
  EntryKind,
  { plural: string; singular: string; organization: string; title: string }
> = {
  work: {
    plural: 'Work',
    singular: 'Work-Eintrag',
    organization: 'Firma',
    title: 'Rolle',
  },
  education: {
    plural: 'Education',
    singular: 'Education-Eintrag',
    organization: 'Institution',
    title: 'Abschluss',
  },
}

/** Route param -> kind; anything else under /admin/<x> is a 404. */
export function parseKind(param: string): EntryKind {
  if (param === 'work' || param === 'education') return param
  notFound()
}
