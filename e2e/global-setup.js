/**
 * Builds the single self-contained binary (frontend + site embedded) once,
 * before the suite runs, so every spec exercises exactly what ships. Mirrors
 * flowstock's e2e/global-setup.js: rebuilds are skipped when the binary is
 * already newer than every source file. Set PROPFIX_SKIP_BUILD=1 to
 * force-skip, or point PROPFIX_BIN at a prebuilt binary (CI can build it as
 * its own step).
 *
 * This step itself works today (`npm run build:all` succeeds and produces
 * backend/propfix) — what it produces does not yet serve the app UI. See
 * playwright.config.js for why every spec is skipped regardless.
 */

import { execSync } from 'child_process'
import { existsSync, statSync, readdirSync } from 'fs'
import { join } from 'path'
import { BIN, ROOT } from './helpers/node.js'

const SOURCE_DIRS = ['src', 'backend']
const SOURCE_FILES = ['index.html', 'package.json', 'vite.config.js', 'tailwind.config.js']
const IGNORED = new Set(['node_modules', 'dist', '.git', 'propfix'])

function newestMtime(path) {
  if (!existsSync(path)) return 0
  const st = statSync(path)
  if (!st.isDirectory()) return st.mtimeMs
  let newest = st.mtimeMs
  for (const entry of readdirSync(path)) {
    if (IGNORED.has(entry)) continue
    newest = Math.max(newest, newestMtime(join(path, entry)))
  }
  return newest
}

export default function globalSetup() {
  if (process.env.PROPFIX_SKIP_BUILD === '1') {
    if (!existsSync(BIN)) {
      throw new Error(`PROPFIX_SKIP_BUILD=1 but no binary at ${BIN}`)
    }
    return
  }

  if (existsSync(BIN)) {
    const binAge = statSync(BIN).mtimeMs
    const srcAge = Math.max(
      ...SOURCE_DIRS.map((d) => newestMtime(join(ROOT, d))),
      ...SOURCE_FILES.map((f) => newestMtime(join(ROOT, f))),
    )
    if (binAge >= srcAge) {
      console.log('e2e: reusing up-to-date propfix binary')
      return
    }
  }

  console.log('e2e: building propfix (frontend + site embedded)…')
  execSync('npm run build:all', { cwd: ROOT, stdio: 'inherit' })
}
