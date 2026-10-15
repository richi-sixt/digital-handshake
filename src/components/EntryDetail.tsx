import { notFound } from 'next/navigation'

import { EntryLayout } from '@/components/EntryLayout'
import { LocalizedBody } from '@/components/LocalizedBody'
import { Markdown } from '@/components/Markdown'
import { getAllApps } from '@/lib/apps'
import { type EntryKind, getEntry } from '@/lib/entries'

/** Server-rendered detail page shared by /work/[slug] and /education/[slug]. */
export async function EntryDetail({
  kind,
  slug,
}: {
  kind: EntryKind
  slug: string
}) {
  let entry = await getEntry(kind, slug)
  if (!entry) notFound()

  // Linked projects (work only); unknown slugs are ignored.
  let apps =
    kind === 'work' && entry.related_apps.length > 0
      ? (await getAllApps()).filter((a) => entry.related_apps.includes(a.slug))
      : []

  return (
    <EntryLayout kind={kind} entry={entry} apps={apps}>
      <LocalizedBody
        en={<Markdown>{entry.body_en}</Markdown>}
        de={entry.body_de ? <Markdown>{entry.body_de}</Markdown> : null}
      />
    </EntryLayout>
  )
}
