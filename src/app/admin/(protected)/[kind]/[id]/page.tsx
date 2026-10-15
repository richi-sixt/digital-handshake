import { notFound } from 'next/navigation'

import { EntryEditor } from '@/app/admin/(protected)/[kind]/EntryEditor'
import { parseKind } from '@/app/admin/(protected)/[kind]/kinds'
import { getAllApps } from '@/lib/apps'
import { type EntryRow } from '@/lib/entries'
import { createClient } from '@/lib/supabase/server'

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>
}) {
  let { kind: kindParam, id } = await params
  let kind = parseKind(kindParam)

  let supabase = await createClient()
  let { data: entry } = await supabase
    .from('entries')
    .select('*')
    .eq('id', id)
    .eq('kind', kind)
    .maybeSingle()
  if (!entry) notFound()

  let apps = (await getAllApps()).map((a) => ({ slug: a.slug, title: a.title }))

  return <EntryEditor kind={kind} initial={entry as EntryRow} apps={apps} />
}
