import { defineConfig, devices } from '@playwright/test'

/**
 * PropFix end-to-end tests.
 *
 * Every spec is meant to boot the real Go binary (`./backend/propfix --demo`)
 * against an ephemeral in-memory database, so there is no global `webServer`
 * here — see e2e/helpers/node.js. That mirrors flowstock's e2e harness.
 *
 * STATUS: every spec in e2e/ is currently `test.skip` — see each spec's
 * header comment for the precise reason. In short: backend/cmd/propfix has
 * no //go:embed for the built React app and main.go registers no "/" route,
 * so the compiled binary this config builds does not serve the app UI yet
 * (it serves /api/ and the marketing /site/ only). The harness itself
 * (global-setup, the PropFixNode helper) is real and exercised by `npm run
 * test:e2e` today — only the specs are gated pending that embed landing.
 */
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Each test navigates to its own node's origin, so no global baseURL.
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
