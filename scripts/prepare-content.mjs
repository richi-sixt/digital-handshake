#!/usr/bin/env node

/**
 * prepare-content.mjs
 *
 * Copies content entries from content/ into src/app/ before build/dev.
 *
 * The content/ directory is the single source of truth.
 * Use content-examples/ as a reference to create your own entries.
 *
 * Usage:
 *   node scripts/prepare-content.mjs
 */

import { existsSync, cpSync, rmSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const CONTENT_DIR = join(ROOT, 'content')
const APP_DIR = join(ROOT, 'src', 'app')

const SECTIONS = ['projects', 'work', 'education']

/**
 * Remove all content subdirectories from src/app/{section}/
 * but preserve top-level files (page.tsx, etc.)
 */
function cleanSection(section) {
  const sectionDir = join(APP_DIR, section)
  if (!existsSync(sectionDir)) return

  const entries = readdirSync(sectionDir)
  for (const entry of entries) {
    const fullPath = join(sectionDir, entry)
    if (statSync(fullPath).isDirectory()) {
      rmSync(fullPath, { recursive: true, force: true })
    }
  }
}

/**
 * Copy entry subdirectories from content/{section} into src/app/{section}/
 */
function copySection(section) {
  const sourceDir = join(CONTENT_DIR, section)
  const targetDir = join(APP_DIR, section)

  if (!existsSync(sourceDir)) {
    return 0
  }

  const entries = readdirSync(sourceDir)
  let count = 0

  for (const entry of entries) {
    const sourcePath = join(sourceDir, entry)
    if (!statSync(sourcePath).isDirectory()) continue

    const targetPath = join(targetDir, entry)
    cpSync(sourcePath, targetPath, { recursive: true })
    count++
  }

  return count
}

// --- Main ---

console.log('📄 Preparing content from content/...\n')

if (!existsSync(CONTENT_DIR)) {
  console.log('⚠  content/ directory not found.')
  console.log('   Copy entries from content-examples/ to content/ to get started.\n')
  process.exit(0)
}

let totalCopied = 0

for (const section of SECTIONS) {
  cleanSection(section)
  const count = copySection(section)
  console.log(`   ${section}/ → ${count} entries copied`)
  totalCopied += count
}

console.log(`\n✅ Done! ${totalCopied} content entries prepared.\n`)
