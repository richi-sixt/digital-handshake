import { notFound } from 'next/navigation'

import { PostEditor } from '@/app/admin/(protected)/posts/PostEditor'
import { type PostRow } from '@/lib/posts'
import { createClient } from '@/lib/supabase/server'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  let { id } = await params
  let supabase = await createClient()

  let [{ data: post }, { data: cats }] = await Promise.all([
    supabase.from('posts').select('*').eq('id', id).maybeSingle(),
    supabase.from('posts').select('category'),
  ])
  if (!post) notFound()

  let categories = [...new Set((cats ?? []).map((r) => r.category))].sort()

  return <PostEditor initial={post as PostRow} categories={categories} />
}
