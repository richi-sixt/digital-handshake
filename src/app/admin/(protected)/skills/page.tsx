import { SkillsEditor } from '@/app/admin/(protected)/skills/SkillsEditor'
import { SKILL_COLUMNS, type SkillRow } from '@/lib/skills'
import { createClient } from '@/lib/supabase/server'

export default async function SkillsAdmin() {
  let supabase = await createClient()
  let { data, error } = await supabase
    .from('skills')
    .select(SKILL_COLUMNS)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100">
        Skills
      </h1>
      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          Skills konnten nicht geladen werden: {error.message}. Wurde die
          Migration 0007_skills.sql ausgeführt?
        </p>
      )}
      <SkillsEditor initial={(data ?? []) as SkillRow[]} />
    </>
  )
}
