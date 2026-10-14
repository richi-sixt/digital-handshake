'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import { type PostInput, validatePostInput } from '@/lib/post-input'
import { POSTS_TAG } from '@/lib/posts'
import { createClient } from '@/lib/supabase/server'

type SaveResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string }

async function requireAdmin() {
  let supabase = await createClient()
  let {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  let { data: isAdmin } = await supabase.rpc('is_admin')
  return isAdmin ? supabase : null
}

function refreshPublicPages() {
  updateTag(POSTS_TAG)
  revalidatePath('/', 'layout')
}

export async function savePost(input: PostInput): Promise<SaveResult> {
  let supabase = await requireAdmin()
  if (!supabase) return { ok: false, error: 'Nicht angemeldet.' }

  let invalid = validatePostInput(input)
  if (invalid) return { ok: false, error: invalid }

  let clean = (items: string[]) =>
    [...new Set(items.map((i) => i.trim()).filter(Boolean))]

  let row = {
    slug: input.slug,
    status: input.status,
    date: input.date,
    category: input.category.trim(),
    tags: clean(input.tags),
    related_apps: clean(input.related_apps),
    related_work: clean(input.related_work),
    title_en: input.title_en.trim(),
    title_de: input.title_de.trim() || null,
    description_en: input.description_en.trim(),
    description_de: input.description_de.trim() || null,
    body_en: input.body_en,
    body_de: input.body_de.trim() ? input.body_de : null,
  }

  let { data, error } = input.id
    ? await supabase
        .from('posts')
        .update(row)
        .eq('id', input.id)
        .select('id, slug')
        .single()
    : await supabase.from('posts').insert(row).select('id, slug').single()

  if (error || !data) {
    return {
      ok: false,
      error:
        error?.code === '23505'
          ? 'Dieser Slug existiert bereits.'
          : `Speichern fehlgeschlagen: ${error?.message ?? 'unbekannt'}`,
    }
  }

  refreshPublicPages()
  return { ok: true, id: data.id, slug: data.slug }
}

export async function deletePost(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  let supabase = await requireAdmin()
  if (!supabase) return { ok: false, error: 'Nicht angemeldet.' }

  let { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  refreshPublicPages()
  return { ok: true }
}

export async function signOut() {
  let supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
