import { EntryEditor } from '@/app/admin/(protected)/[kind]/EntryEditor'
import { parseKind } from '@/app/admin/(protected)/[kind]/kinds'
import { getProjectOptions } from '@/app/admin/(protected)/projects/options'

export default async function NewEntryPage({
  params,
}: {
  params: Promise<{ kind: string }>
}) {
  let kind = parseKind((await params).kind)
  let apps = await getProjectOptions()

  return <EntryEditor kind={kind} initial={null} apps={apps} />
}
