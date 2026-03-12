#!/usr/bin/env node

/**
 * prepare-content.mjs
 *
 * Copies MDX content files into src/app/ before build/dev.
 *
 * Priority:
 *   1. content/        → real content (gitignored)
 *   2. content-examples/ → example/dummy content (tracked in git)
 *
 * Usage:
 *   node scripts/prepare-content.mjs           # auto-detect (content/ or fallback to examples)
 *   node scripts/prepare-content.mjs --examples # force use of example content
 */

import { existsSync, cpSync, rmSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const CONTENT_DIR = join(ROOT, 'content')
const EXAMPLES_DIR = join(ROOT, 'content-examples')
const APP_DIR = join(ROOT, 'src', 'app')

const SECTIONS = ['projects', 'work', 'education']

const forceExamples = process.argv.includes('--examples')

/**
 * Remove all content subdirectories from src/app/{section}/
 * but preserve the list page files (page.tsx, page.jsx, etc.)
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
 * Copy content subdirectories from source into src/app/{section}/
 */
function copySection(sourceBase, section) {
  const sourceDir = join(sourceBase, section)
  const targetDir = join(APP_DIR, section)

  if (!existsSync(sourceDir)) {
    console.log(`  ⚠ No ${section}/ directory found in ${sourceBase}, skipping`)
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

console.log('📄 Preparing content...\n')

// Determine source
let sourceDir
let sourceLabel

if (forceExamples) {
  sourceDir = EXAMPLES_DIR
  sourceLabel = 'content-examples/ (forced)'
} else if (existsSync(CONTENT_DIR) && hasContent(CONTENT_DIR)) {
  sourceDir = CONTENT_DIR
  sourceLabel = 'content/ (real)'
} else {
  sourceDir = EXAMPLES_DIR
  sourceLabel = 'content-examples/ (fallback)'
}

console.log(`📁 Source: ${sourceLabel}\n`)

// Clean and copy each section
let totalCopied = 0

for (const section of SECTIONS) {
  console.log(`🔄 ${section}/`)
  cleanSection(section)
  const count = copySection(sourceDir, section)
  console.log(`   → ${count} entries copied`)
  totalCopied += count
}

console.log(`\n✅ Done! ${totalCopied} content entries prepared.\n`)

/**
 * Check if a content directory has any MDX files
 */
function hasContent(dir) {
  for (const section of SECTIONS) {
    const sectionDir = join(dir, section)
    if (!existsSync(sectionDir)) continue

    const entries = readdirSync(sectionDir)
    for (const entry of entries) {
      const entryPath = join(sectionDir, entry)
      if (statSync(entryPath).isDirectory()) {
        const mdxPath = join(entryPath, 'page.mdx')
        if (existsSync(mdxPath)) return true
      }
    }
  }
  return false
}
