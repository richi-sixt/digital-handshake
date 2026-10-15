import { type Metadata } from 'next'

import { EntryList } from '@/components/EntryList'
import { getEntries } from '@/lib/entries'

export const metadata: Metadata = {
  title: 'Work',
  description: 'My professional experience in insurance, consulting, and IT.',
}

export default async function WorkIndex() {
  let entries = await getEntries('work')

  return <EntryList kind="work" entries={entries} />
}
