/**
 * Smoke: sign in with the demo credentials and land on the jobs board.
 *
 * SKIPPED: the binary this suite builds (see global-setup.js) does not serve
 * the app UI. backend/cmd/propfix has no //go:embed for the built React app
 * (only site_embed.go, which embeds the marketing site under /site/) and
 * main.go registers no "/" route — so navigating to `/` or `/login` on the
 * running binary 404s today, regardless of how complete src/ is. Remove the
 * `test.skip` line below once that embed lands; the flow itself is written
 * against the real LoginPage (src/pages/LoginPage.jsx) and demo credentials
 * (backend/cmd/propfix/demo.go).
 */

import { test, expect } from '@playwright/test'
import { PropFixNode } from './helpers/node.js'
import { login } from './helpers/ui.js'

test.describe('login', () => {
  let node

  test.beforeEach(async () => {
    node = await PropFixNode.start()
  })

  test.afterEach(async () => {
    await node?.stop()
  })

  test('demo credentials sign in and land on the jobs board', async ({ page }) => {
    test.skip(true, 'app UI not served by the binary yet — see this file\'s header comment')

    await login(page, node.baseURL)
    await expect(page.getByRole('heading', { name: 'Jobs' })).toBeVisible()
  })

  test('a wrong password shows an inline error and does not navigate', async ({ page }) => {
    test.skip(true, 'app UI not served by the binary yet — see this file\'s header comment')

    await page.goto(`${node.baseURL}/login`)
    await page.getByLabel('Email').fill('demo@propfix.local')
    await page.getByLabel('Password').fill('not-the-password')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/could not sign in|invalid/i)).toBeVisible()
    await expect(page).toHaveURL(`${node.baseURL}/login`)
  })
})
