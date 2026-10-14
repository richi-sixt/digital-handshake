#!/usr/bin/env node

/**
 * import-journal.mjs
 *
 * One-off import of the MDX entries in journal/ into the Supabase `posts` table.
 *
 *   node scripts/import-journal.mjs                       # dry run (default)
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-journal.mjs --apply
 *
 * Flags:
 *   --apply      write to Supabase (uploads screenshots, inserts posts)
 *   --overwrite  also replace posts whose slug already exists (default: skip)
 *
 * The service-role key is read from the environment only (never from a file)
 * because the script must bypass row level security once. Do not commit it.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'

import { createClient } from '@supabase/supabase-js'

const ROOT = resolve(import.meta.dirname, '..')
const JOURNAL_DIR = join(ROOT, 'journal')
const SCREENSHOTS_DIR = join(JOURNAL_DIR, 'screenshots')
const DE_TRANSLATIONS = join(ROOT, 'src', 'i18n', 'translations', 'de.ts')
const BUCKET = 'blog-images'

// Entries that cannot be expressed as plain Markdown (live React demos).
const SKIP = new Set(['2026-03-17-learn-react'])

const apply = process.argv.includes('--apply')
const overwrite = process.argv.includes('--overwrite')

// --- env -------------------------------------------------------------------

function readEnvFile(name) {
  const file = join(ROOT, '.env.local')
  if (!existsSync(file)) return undefined
  const line = readFileSync(file, 'utf8')
    .split('\n')
    .find((l) => l.startsWith(`${name}=`))
  return line?.slice(name.length + 1).trim().replace(/^["']|["']$/g, '')
}

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  readEnvFile('NEXT_PUBLIC_SUPABASE_URL')
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) {
  console.error('NEXT_PUBLIC_SUPABASE_URL not found (env or .env.local).')
  process.exit(1)
}
if (apply && !SERVICE_KEY) {
  console.error('--apply needs SUPABASE_SERVICE_ROLE_KEY in the environment.')
  process.exit(1)
}

const IMAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/legacy`

// --- parsing ---------------------------------------------------------------

const META_RE = /^export const entry = (\{[\s\S]*?\n\})\s*\n/m

/** Splits an MDX file into its `entry` metadata (if any) and the body. */
function splitMdx(source) {
  const match = source.match(META_RE)
  if (!match) return { meta: null, body: source.trim() }
  // Local, trusted file: evaluating the object literal is fine here.
  const meta = new Function(`return ${match[1]}`)()
  return { meta, body: source.replace(META_RE, '').trim() }
}

/** German titles/descriptions live in de.ts as 'blog.<short-slug>.title'. */
function readGermanMeta() {
  const map = new Map()
  const source = readFileSync(DE_TRANSLATIONS, 'utf8')
  const re = /'blog\.([\w-]+)\.(title|description)':\s*'((?:[^'\\]|\\.)*)'/g
  for (const [, short, field, raw] of source.matchAll(re)) {
    const value = new Function(`return '${raw}'`)()
    map.set(`${short}.${field}`, value)
  }
  return map
}

// --- link/image rewriting --------------------------------------------------

function makeRewriter(slugs, warnings, images) {
  const resolveSlug = (short) => {
    if (slugs.has(short)) return short
    const matches = [...slugs].filter((s) => s.endsWith(`-${short}`))
    return matches.length === 1 ? matches[0] : null
  }

  return function rewrite(body, slug) {
    let changes = 0

    // Screenshots → public storage URL.
    body = body.replace(/\/journal\/screenshots\/([^)"'\s]+)/g, (_, name) => {
      images.add(name)
      changes++
      return `${IMAGE_BASE}/${name}`
    })

    // Old absolute playground URLs → relative.
    body = body.replace(
      /(\]\(|href=")https:\/\/playground\.sixt\.services(\/(?:journal|apps)\/)/g,
      (_, pre, path) => {
        changes++
        return `${pre}${path}`
      },
    )

    // /journal/<slug>/ links → /blog/<full-slug>/ (also fixes short slugs).
    body = body.replace(
      /(\]\(|href=")\/journal\/([a-z0-9-]+)(\/?)([#?][^)"\s]*)?/g,
      (full, pre, short, slash, rest = '') => {
        const target = resolveSlug(short)
        if (!target) {
          warnings.push(`${slug}: link to unknown entry /journal/${short}/`)
          return `${pre}/blog/${short}/${rest}`
        }
        changes++
        return `${pre}/blog/${target}/${rest}`
      },
    )

    return { body, changes }
  }
}

// --- main ------------------------------------------------------------------

const dirs = readdirSync(JOURNAL_DIR).filter(
  (d) =>
    statSync(join(JOURNAL_DIR, d)).isDirectory() &&
    existsSync(join(JOURNAL_DIR, d, 'page.en.mdx')),
)

const skipped = dirs.filter((d) => SKIP.has(d))
const slugs = new Set(dirs.filter((d) => !SKIP.has(d)))
const german = readGermanMeta()
const warnings = []
const images = new Set()
const rewrite = makeRewriter(slugs, warnings, images)

const rows = []
for (const slug of slugs) {
  const dir = join(JOURNAL_DIR, slug)
  const en = splitMdx(readFileSync(join(dir, 'page.en.mdx'), 'utf8'))
  if (!en.meta) {
    warnings.push(`${slug}: no "export const entry" metadata, skipped`)
    continue
  }

  let deBody = null
  const dePath = join(dir, 'page.de.mdx')
  if (existsSync(dePath)) {
    const de = splitMdx(readFileSync(dePath, 'utf8'))
    deBody = de.body.length > 40 ? de.body : null
  }

  const short = slug.replace(/^\d{4}-\d{2}-\d{2}-/, '')
  const bodyEn = rewrite(en.body, slug)
  const bodyDe = deBody ? rewrite(deBody, slug) : null

  rows.push({
    summary: {
      slug,
      links: bodyEn.changes + (bodyDe?.changes ?? 0),
      de: Boolean(bodyDe),
    },
    row: {
      slug,
      status: 'published',
      date: en.meta.date,
      category: en.meta.category ?? 'development',
      tags: en.meta.tags ?? [],
      related_apps: en.meta.relatedApps ?? [],
      related_work: en.meta.relatedWork ?? [],
      title_en: en.meta.title,
      title_de: german.get(`${short}.title`) ?? null,
      description_en: en.meta.description ?? '',
      description_de: german.get(`${short}.description`) ?? null,
      body_en: bodyEn.body,
      body_de: bodyDe?.body ?? null,
    },
  })
}

// Report.
console.log(`\n${apply ? 'APPLY' : 'DRY RUN'}: ${rows.length} entries`)
for (const { row, summary } of rows) {
  console.log(
    `  ${row.slug.padEnd(36)} en:${String(row.body_en.split('\n').length).padStart(5)} lines` +
      `  de:${summary.de ? 'yes' : '-  '}  title_de:${row.title_de ? 'yes' : '-  '}` +
      `  rewrites:${summary.links}`,
  )
}
if (skipped.length) console.log(`  skipped (by choice): ${skipped.join(', ')}`)
console.log(`  screenshots referenced: ${images.size} (${[...images].join(', ')})`)
for (const w of warnings) console.log(`  ! ${w}`)

if (!apply) {
  console.log('\nNothing written. Re-run with --apply to import.\n')
  process.exit(0)
}

// Write.
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml' }

for (const name of images) {
  const file = join(SCREENSHOTS_DIR, name)
  if (!existsSync(file)) {
    console.log(`  ! screenshot missing on disk: ${name}`)
    continue
  }
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(`legacy/${name}`, readFileSync(file), {
      contentType: MIME[extname(name).toLowerCase()] ?? 'application/octet-stream',
      upsert: true,
    })
  console.log(error ? `  ! upload ${name}: ${error.message}` : `  uploaded ${name}`)
}

const { data: existing, error: listError } = await supabase
  .from('posts')
  .select('slug')
if (listError) {
  console.error(`Could not read posts: ${listError.message}`)
  process.exit(1)
}
const taken = new Set(existing.map((p) => p.slug))

let written = 0
for (const { row } of rows) {
  if (taken.has(row.slug) && !overwrite) {
    console.log(`  = exists, skipped: ${row.slug} (use --overwrite)`)
    continue
  }
  const { error } = await supabase.from('posts').upsert(row, { onConflict: 'slug' })
  if (error) console.log(`  ! ${row.slug}: ${error.message}`)
  else {
    written++
    console.log(`  imported ${row.slug}`)
  }
}
console.log(`\nDone: ${written} written.\n`)
