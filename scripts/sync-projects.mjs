#!/usr/bin/env node

/**
 * sync-projects.mjs
 *
 * Copies playground's exported projects.json into data/playground-projects.json.
 * Run this before building digital-handshake to get the latest project data.
 *
 * Usage:
 *   node scripts/sync-projects.mjs
 */

import { existsSync, mkdirSync, copyFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const PLAYGROUND_ROOT = process.env.PLAYGROUND_ROOT 
  ? resolve(process.env.PLAYGROUND_ROOT) // Server-variable with local fallback
  : resolve(ROOT, '..', 'react-playground')
const SOURCE = join(PLAYGROUND_ROOT, 'public', 'api', 'projects.json')
const DATA_DIR = join(ROOT, 'data')
const TARGET = join(DATA_DIR, 'playground-projects.json')

if (!existsSync(SOURCE)) {
  console.warn(
    `⚠ Source not found: ${SOURCE}\n` +
      `  Run "npm run export-projects" in the playground project first.\n`,
  )
  process.exit(0) // Don't fail the build — just warn
}

mkdirSync(DATA_DIR, { recursive: true })
copyFileSync(SOURCE, TARGET)

console.log(`✅ Synced projects from playground → ${TARGET}`)
