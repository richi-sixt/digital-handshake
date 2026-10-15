import { type Metadata } from 'next'

import { EntryList } from '@/components/EntryList'
import { getEntries } from '@/lib/entries'

export const metadata: Metadata = {
  title: 'Education',
  description: 'My educational background and professional certifications.',
}

export default async function EducationIndex() {
  let entries = await getEntries('education')

  return <EntryList kind="education" entries={entries} />
}
