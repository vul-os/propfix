/**
 * Smoke: the jobs board shows the seeded demo jobs and can be filtered.
 *
 * SKIPPED — see e2e/login.spec.js's header comment for why (no app embed /
 * no "/" route in the compiled binary yet). Selectors are written against
 * the real JobsBoardPage (src/pages/JobsBoardPage.jsx) and the demo dataset
 * (backend/cmd/propfix/demo.go — "Meridian Property Management", Riverside
 * Court / Harbour View / Oakmead Mews).
 */

import { test, expect } from '@playwright/test'
import { PropFixNode } from './helpers/node.js'
import { login } from './helpers/ui.js'

test.describe('jobs board', () => {
  let node

  test.beforeEach(async () => {
    node = await PropFixNode.start()
  })

  test.afterEach(async () => {
    await node?.stop()
  })

  test('shows seeded demo jobs after login', async ({ page }) => {
    test.skip(true, 'app UI not served by the binary yet — see e2e/login.spec.js')

    await login(page, node.baseURL)
    // demo.go seeds this exact job at Riverside Court / Flat 3A.
    await expect(page.getByText('Kitchen mixer leaking under sink')).toBeVisible()
  })

  test('search filters the board to matching jobs', async ({ page }) => {
    test.skip(true, 'app UI not served by the binary yet — see e2e/login.spec.js')

    await login(page, node.baseURL)
    await page.getByPlaceholder('Title, description, job #').fill('lift service')
    await expect(page.getByText('Lift service overdue')).toBeVisible()
    await expect(page.getByText('Kitchen mixer leaking under sink')).toHaveCount(0)
  })
})
