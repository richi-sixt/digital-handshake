
import { Container } from '@/components/Container'
import { BlogHeader } from '@/components/BlogHeader'
import { BlogList } from '@/components/BlogList'
import { getAllBlogEntries } from '@/lib/blog'

export const metadata = {
  title: 'Blog',
  description:
    'Learnings, experiments, and notes from building apps with React.',
}

export default async function BlogPage() {
  let entries = await getAllBlogEntries()

  return (
    <Container className="mt-16 sm:mt-32">
      <BlogHeader />
      <div className="mt-16 sm:mt-20">
        <BlogList entries={entries} />
      </div>
    </Container>
  )
}
