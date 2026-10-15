import { type Metadata } from 'next'

import { EntryDetail } from '@/components/EntryDetail'
import { getEntry } from '@/lib/entries'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let { slug } = await params
  let entry = await getEntry('education', slug)
  if (!entry) return {}

  return { title: entry.organization, description: entry.description_en }
}

export default async function Page({ params }: Props) {
  let { slug } = await params
  return <EntryDetail kind="education" slug={slug} />
}
