import { PostEditor } from '@/app/admin/(protected)/posts/PostEditor'
import { createClient } from '@/lib/supabase/server'

export default async function NewPostPage() {
  let supabase = await createClient()
  let { data } = await supabase.from('posts').select('category')
  let categories = [...new Set((data ?? []).map((r) => r.category))].sort()

  return <PostEditor initial={null} categories={categories} />
}
