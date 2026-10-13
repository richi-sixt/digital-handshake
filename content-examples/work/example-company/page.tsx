import { WorkLayout } from '@/components/WorkLayout'
import { MdxContent } from './MdxContent'
import { work } from './page.en.mdx'

export const metadata = {
  title: work.company,
  description: work.description,
}

export default function Page() {
  return (
    <WorkLayout work={work}>
      <MdxContent />
    </WorkLayout>
  )
}
