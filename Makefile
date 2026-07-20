VERSION := $(shell cat VERSION 2>/dev/null || echo dev)

.PHONY: dev dev-app build build-frontend test test-go test-e2e lint \
        screenshots qa-shots notices check run

# UI-only dev loop: Vite dev server + hot reload, proxying /api to a
# separately-running backend (see `make dev-app`).
dev:
	npm run dev

# Go server, no embedded frontend — pairs with `make dev` (or a browser
# pointed straight at :8099/api/...).
dev-app:
	cd backend && go run ./cmd/propfix --demo --addr 127.0.0.1:8799

# Full single-binary build: frontend bundle + Go binary with the site
# embedded (build tag `embed_frontend`, see scripts/build-embedded.sh).
# NOTE: as of this writing, backend/cmd/propfix only embeds the marketing
# site (site/ -> /site/); there is no //go:embed for the built app (dist/)
# yet and main.go registers no "/" route, so this binary does not yet serve
# the app UI. It embeds the marketing site and runs the full API. See the
# repo furniture report for details.
build: build-frontend
	./scripts/build-embedded.sh

build-frontend:
	npm run build

# Tests
test: test-go test-e2e

test-go:
	cd backend && go test ./...

# Browser end-to-end tests against the real binary (builds it if stale, see
# e2e/global-setup.js). Needs `npx playwright install chromium` once.
#
# NOTE: currently every spec in e2e/ is skipped — the binary built here does
# not yet serve the app UI (see the `build` target note above), so there is
# nothing for Playwright to drive. The harness itself (global-setup, node
# helper, playwright.config.js) is real and runs; only the specs are stubs
# pending the frontend landing.
test-e2e:
	npx playwright test

lint:
	npm run lint

# Screenshots for docs/README (docs/screenshots/). Drives `./propfix --demo`
# via Playwright. Same caveat as test-e2e: produces nothing useful until the
# binary serves the app UI — see scripts/screenshots.mjs's own guard.
screenshots:
	npm run screenshots

# Every route x 3 widths x both themes into a gitignored scratch dir, for
# manual visual QA. Not part of `check`.
qa-shots:
	npm run qa-shots

# Regenerate THIRD-PARTY-NOTICES.txt (root) + site/licenses.txt from the real
# dependency graph (Go modules + npm + vendored site assets). Served at
# /licenses.txt once the app embed lands; always available as a file today.
# Re-run after changing backend/go.mod or package.json.
notices:
	./scripts/gen-notices.sh

# One verification gate — run before every commit that touches build,
# backend or frontend code.
check:
	./scripts/check.sh

run: build
	./backend/propfix
