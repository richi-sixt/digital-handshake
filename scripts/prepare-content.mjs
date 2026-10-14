#!/usr/bin/env node

/**
 * prepare-content.mjs
 *
 * Copies content/work|education (private git submodule) into
 * src/app/work|education/ before build/dev. The generated folders are
 * gitignored. Use content-examples/ as a reference for the entry format.
 * Blog posts are not handled here; they live in the Supabase `posts` table.
 *
 * Usage:
 *   node scripts/prepare-content.mjs
 */

import { existsSync, cpSync, rmSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const CONTENT_DIR = join(ROOT, 'content')
const APP_DIR = join(ROOT, 'src', 'app')
const SECTIONS = ['work', 'education']

/**
 * Replace the generated entry folders in src/app/{section}/ with the ones from
 * content/{section}. Top-level files (page.tsx) are preserved.
 */
function copySection(section) {
  const sourceDir = join(CONTENT_DIR, section)
  const targetDir = join(APP_DIR, section)

  if (existsSync(targetDir)) {
    for (const entry of readdirSync(targetDir)) {
      const fullPath = join(targetDir, entry)
      if (statSync(fullPath).isDirectory()) {
        rmSync(fullPath, { recursive: true, force: true })
      }
    }
  }

  if (!existsSync(sourceDir)) return 0

  let count = 0
  for (const entry of readdirSync(sourceDir)) {
    const sourcePath = join(sourceDir, entry)
    if (!statSync(sourcePath).isDirectory()) continue
    cpSync(sourcePath, join(targetDir, entry), { recursive: true })
    count++
  }
  return count
}

// --- Main ---

console.log('📄 Preparing content...\n')

if (!existsSync(CONTENT_DIR)) {
  console.log('⚠  content/ directory not found (copy from content-examples/).\n')
  process.exit(0)
}

for (const section of SECTIONS) {
  console.log(`   → ${section}: ${copySection(section)} entries copied`)
}

console.log('\n✅ Done!\n')
