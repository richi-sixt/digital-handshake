import { EducationLayout } from '@/components/EducationLayout'
import { MdxContent } from './MdxContent'
import { education } from './page.en.mdx'

const entry = { ...education, slug: 'example-university' }

export const metadata = {
  title: entry.institution,
  description: entry.description,
}

export default function Page() {
  return (
    <EducationLayout education={entry}>
      <MdxContent />
    </EducationLayout>
  )
}
