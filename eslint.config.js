import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'site/assets/vendor/**', 'backend/**']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // Node-context files: scripts/, playwright.config.js, e2e/ and the
    // top-level tooling configs (vite/tailwind/postcss/eslint) run under
    // Node (the build tooling / test runner), not the browser.
    files: [
      'scripts/**/*.{js,mjs}',
      'playwright.config.js',
      'e2e/**/*.{js,jsx}',
      '*.config.js',
      'eslint.config.js',
    ],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      // Playwright's fixture API is `async ({ page }, use) => { await use(x) }`.
      // React also has a `use` hook, so rules-of-hooks sees the call and
      // demands the enclosing function be a component/hook. It is neither.
      'react-hooks/rules-of-hooks': 'off',
    },
  },
])
