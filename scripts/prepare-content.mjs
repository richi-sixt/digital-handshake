#!/usr/bin/env node

/**
 * prepare-content.mjs
 *
 * Copies content into src/app/ before build/dev:
 *   - journal/            → src/app/journal/ (+ assets to public/journal/)
 *   - content/work|education → src/app/work|education/
 *
 * journal/ and content/ are private git submodules and the single source of truth.
 * Use journal-examples/ and content-examples/ as references.
 *
 * Usage:
 *   node scripts/prepare-content.mjs
 */

import { existsSync, cpSync, rmSync, readdirSync, statSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const JOURNAL_DIR = join(ROOT, 'journal')
const TARGET_DIR = join(ROOT, 'src', 'app', 'journal')
const PUBLIC_JOURNAL_DIR = join(ROOT, 'public', 'journal')
const CONTENT_DIR = join(ROOT, 'content')
const APP_DIR = join(ROOT, 'src', 'app')
const CONTENT_SECTIONS = ['work', 'education']

/** File extensions that are treated as journal entry pages. */
const PAGE_EXTENSIONS = new Set(['.mdx', '.md', '.tsx', '.ts', '.jsx', '.js'])

/**
 * Remove all content subdirectories from src/app/journal/
 * but preserve top-level files (page.tsx, etc.)
 */
function cleanTarget() {
  if (!existsSync(TARGET_DIR)) return

  const entries = readdirSync(TARGET_DIR)
  for (const entry of entries) {
    const fullPath = join(TARGET_DIR, entry)
    if (statSync(fullPath).isDirectory()) {
      rmSync(fullPath, { recursive: true, force: true })
    }
  }
}

/**
 * Check whether a directory looks like a journal entry (contains page files)
 * vs. a static asset directory (screenshots, images, etc.)
 */
function isEntryDirectory(dirPath) {
  const files = readdirSync(dirPath)
  return files.some((f) => {
    const ext = f.slice(f.lastIndexOf('.'))
    return PAGE_EXTENSIONS.has(ext)
  })
}

/**
 * Copy entry subdirectories from journal/ into src/app/journal/
 * and copy asset directories into public/journal/ for static serving.
 */
function copyEntries() {
  if (!existsSync(JOURNAL_DIR)) {
    return { entries: 0, assets: 0 }
  }

  const items = readdirSync(JOURNAL_DIR)
  let entries = 0
  let assets = 0

  for (const item of items) {
    const sourcePath = join(JOURNAL_DIR, item)
    if (!statSync(sourcePath).isDirectory()) continue

    if (isEntryDirectory(sourcePath)) {
      // Journal entry → copy to src/app/journal/ for Next.js routing
      const targetPath = join(TARGET_DIR, item)
      cpSync(sourcePath, targetPath, { recursive: true })
      entries++
    } else {
      // Asset directory (screenshots, images, etc.) → copy to public/journal/
      const publicPath = join(PUBLIC_JOURNAL_DIR, item)
      mkdirSync(publicPath, { recursive: true })
      cpSync(sourcePath, publicPath, { recursive: true })
      assets++
    }
  }

  return { entries, assets }
}

/**
 * Copy content/{section}/* into src/app/{section}/ (work, education).
 * Generated folders are gitignored; top-level files (page.tsx) are preserved.
 */
function copyContentSection(section) {
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

if (existsSync(JOURNAL_DIR)) {
  cleanTarget()
  const { entries, assets } = copyEntries()
  console.log(`   → journal: ${entries} entries copied`)
  if (assets > 0) {
    console.log(`   → journal: ${assets} asset folders copied to public/journal/`)
  }
} else {
  console.log('⚠  journal/ directory not found (copy from journal-examples/).')
}

if (existsSync(CONTENT_DIR)) {
  for (const section of CONTENT_SECTIONS) {
    console.log(`   → ${section}: ${copyContentSection(section)} entries copied`)
  }
} else {
  console.log('⚠  content/ directory not found (copy from content-examples/).')
}

console.log('\n✅ Done!\n')
