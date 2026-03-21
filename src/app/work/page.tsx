import { type Metadata } from 'next'

import { WorkPageContent } from '@/components/WorkPageContent'
import { getAllWork } from '@/lib/work'

export const metadata: Metadata = {
  title: 'Work',
  description:
    'My professional experience in insurance, consulting, and IT.',
}

export default async function WorkIndex() {
  let works = await getAllWork()

  return <WorkPageContent works={works} />
}
