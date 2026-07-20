#!/usr/bin/env sh
# Build the single-binary release: the site is copied next to the embed
# directive and compiled into the binary (build tag `embed_frontend`).
#
# The copy is needed because //go:embed cannot reach outside its own package
# directory, and the site lives at the repo root where the site tooling expects
# it. A plain `go build ./...` skips all of this and uses site_dev.go, which
# serves the site from disk — so developers and CI never need to run this.
set -eu

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
staging="$root/backend/cmd/propfix/site"

if [ ! -d "$root/site" ]; then
  echo "build-embedded: no site/ at the repo root — nothing to embed" >&2
  exit 1
fi

rm -rf "$staging"
mkdir -p "$staging"
cp -R "$root/site/." "$staging/"

cd "$root/backend"
go build -tags embed_frontend -o "$root/backend/propfix" ./cmd/propfix

# The staging copy is build input, not source. Leaving it behind would make
# `git status` dirty and tempt somebody to commit a second copy of the site.
rm -rf "$staging"

echo "build-embedded: wrote $root/backend/propfix"
