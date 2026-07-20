/**
 * Smoke: opening a job from the board shows its detail page — the event
 * thread, cost/time ledgers and the status/assignee controls.
 *
 * SKIPPED — see e2e/login.spec.js's header comment for why (no app embed /
 * no "/" route in the compiled binary yet). Selectors are written against
 * the real JobDetailPage (src/pages/JobDetailPage.jsx).
 */

import { test, expect } from '@playwright/test'
import { PropFixNode } from './helpers/node.js'
import { login } from './helpers/ui.js'

test.describe('job detail', () => {
  let node

  test.beforeEach(async () => {
    node = await PropFixNode.start()
  })

  test.afterEach(async () => {
    await node?.stop()
  })

  test('opening a job from the board shows its detail page', async ({ page }) => {
    test.skip(true, 'app UI not served by the binary yet — see e2e/login.spec.js')

    await login(page, node.baseURL)
    await page.getByText('Kitchen mixer leaking under sink').click()

    await expect(page.getByRole('heading', { name: 'Kitchen mixer leaking under sink' })).toBeVisible()
    // The status/assignee side panel and the event-thread tab (default tab).
    await expect(page.getByText('Event thread')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Back to jobs' })).toBeVisible()

    await page.getByRole('button', { name: 'Back to jobs' }).click()
    await expect(page).toHaveURL(`${node.baseURL}/jobs`)
  })
})
