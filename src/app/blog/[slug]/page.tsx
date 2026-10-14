import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlogLayout } from '@/components/BlogLayout'
import { LocalizedBody } from '@/components/LocalizedBody'
import { Markdown } from '@/components/Markdown'
import { getPublishedPostBySlug } from '@/lib/posts'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let { slug } = await params
  let post = await getPublishedPostBySlug(slug)
  if (!post) return {}

  return { title: post.title_en, description: post.description_en }
}

export default async function BlogPostPage({ params }: Props) {
  let { slug } = await params
  let post = await getPublishedPostBySlug(slug)
  if (!post) notFound()

  let entry = {
    slug: post.slug,
    title: post.title_en,
    description: post.description_en,
    titleDe: post.title_de,
    descriptionDe: post.description_de,
    date: post.date,
    category: post.category,
    tags: post.tags,
    relatedApps: post.related_apps,
    relatedWork: post.related_work,
  }

  return (
    <BlogLayout entry={entry}>
      <LocalizedBody
        en={<Markdown>{post.body_en}</Markdown>}
        de={post.body_de ? <Markdown>{post.body_de}</Markdown> : null}
      />
    </BlogLayout>
  )
}
