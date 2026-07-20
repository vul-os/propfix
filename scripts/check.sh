#!/usr/bin/env bash
# Single verification gate. Every wave cycle / PR must end with this passing.
#
# Mirrors wede's scripts/check.sh. Steps that cannot run yet (frontend lint,
# frontend test, e2e) because src/ has no app code and built lint yet are
# still invoked — if they are missing they fail loudly here rather than
# silently passing, which is the point of the gate.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fail=0
step() { printf '\n\033[1m== %s ==\033[0m\n' "$1"; }

step "backend: gofmt"
unformatted="$(cd backend && gofmt -l .)"
if [ -n "$unformatted" ]; then
  echo "$unformatted"
  fail=1
fi

step "backend: go vet"
( cd backend && go vet ./... ) || fail=1

step "backend: go build"
( cd backend && go build ./... ) || fail=1

step "backend: go test"
( cd backend && go test ./... ) || fail=1

step "frontend: lint"
npm run lint || fail=1

step "frontend: test"
npm test || fail=1

step "frontend: build"
npm run build || fail=1

if [ "$fail" -ne 0 ]; then
  printf '\n\033[31mCHECK FAILED\033[0m\n'
  exit 1
fi
printf '\n\033[32mCHECK PASSED\033[0m\n'
