import { EntryEditor } from '@/app/admin/(protected)/[kind]/EntryEditor'
import { parseKind } from '@/app/admin/(protected)/[kind]/kinds'
import { getAllApps } from '@/lib/apps'

export default async function NewEntryPage({
  params,
}: {
  params: Promise<{ kind: string }>
}) {
  let kind = parseKind((await params).kind)
  let apps = (await getAllApps()).map((a) => ({ slug: a.slug, title: a.title }))

  return <EntryEditor kind={kind} initial={null} apps={apps} />
}
