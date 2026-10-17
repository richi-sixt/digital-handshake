'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import { ENTRIES_TAG } from '@/lib/entries'
import { type EntryInput, validateEntryInput } from '@/lib/entry-input'
import { type PostInput, validatePostInput } from '@/lib/post-input'
import {
  type ProjectInput,
  normalizeCategory,
  validateProjectInput,
} from '@/lib/project-input'
import { PROJECTS_TAG } from '@/lib/projects'
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

// Public sections only: revalidating '/' as a layout would also re-render the
// current /admin page and send its full content back with every save.
const PUBLIC_SECTIONS = ['/blog', '/work', '/education', '/apps', '/projects']

function refreshPublicPages() {
  updateTag(POSTS_TAG)
  updateTag(ENTRIES_TAG)
  updateTag(PROJECTS_TAG)
  revalidatePath('/')
  for (let path of PUBLIC_SECTIONS) revalidatePath(path, 'layout')
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

export async function saveEntry(input: EntryInput): Promise<SaveResult> {
  let supabase = await requireAdmin()
  if (!supabase) return { ok: false, error: 'Nicht angemeldet.' }

  let invalid = validateEntryInput(input)
  if (invalid) return { ok: false, error: invalid }

  let clean = (items: string[]) =>
    [...new Set(items.map((i) => i.trim()).filter(Boolean))]
  let orNull = (text: string) => text.trim() || null

  let row = {
    kind: input.kind,
    slug: input.slug,
    status: input.status,
    organization: input.organization.trim(),
    location: orNull(input.location),
    field: orNull(input.field),
    title_en: input.title_en.trim(),
    title_de: orNull(input.title_de),
    description_en: input.description_en.trim(),
    description_de: orNull(input.description_de),
    body_en: input.body_en,
    body_de: input.body_de.trim() ? input.body_de : null,
    start_year: input.start_year,
    end_year: input.end_year,
    tech: clean(input.tech),
    related_apps: input.kind === 'work' ? clean(input.related_apps) : [],
    logo_url: orNull(input.logo_url),
    show_on_home: input.show_on_home,
  }

  let { data, error } = input.id
    ? await supabase
        .from('entries')
        .update(row)
        .eq('id', input.id)
        .select('id, slug')
        .single()
    : await supabase.from('entries').insert(row).select('id, slug').single()

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

export async function deleteEntry(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  let supabase = await requireAdmin()
  if (!supabase) return { ok: false, error: 'Nicht angemeldet.' }

  let { error } = await supabase.from('entries').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  refreshPublicPages()
  return { ok: true }
}

export async function saveProject(input: ProjectInput): Promise<SaveResult> {
  let supabase = await requireAdmin()
  if (!supabase) return { ok: false, error: 'Nicht angemeldet.' }

  let invalid = validateProjectInput(input)
  if (invalid) return { ok: false, error: invalid }

  let orNull = (text: string) => text.trim() || null

  let row = {
    slug: input.slug,
    status: input.status,
    title_en: input.title_en.trim(),
    title_de: orNull(input.title_de),
    description_en: input.description_en.trim(),
    description_de: orNull(input.description_de),
    body_en: input.body_en,
    body_de: input.body_de.trim() ? input.body_de : null,
    tech: [...new Set(input.tech.map((t) => t.trim()).filter(Boolean))],
    url: orNull(input.url),
    github: orNull(input.github),
    date: input.date,
    category: normalizeCategory(input.category),
  }

  let { data, error } = input.id
    ? await supabase
        .from('projects')
        .update(row)
        .eq('id', input.id)
        .select('id, slug')
        .single()
    : await supabase.from('projects').insert(row).select('id, slug').single()

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

export async function deleteProject(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  let supabase = await requireAdmin()
  if (!supabase) return { ok: false, error: 'Nicht angemeldet.' }

  let { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  refreshPublicPages()
  return { ok: true }
}

export async function signOut() {
  let supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
