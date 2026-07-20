# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> [!NOTE]
> PropFix is being **rebuilt from scratch**. There is no released, runnable
> software: no binary, no image, no UI. Entries below describe design and
> documentation work, and say so. A feature only appears under **Added** once it
> is implemented — a design document for it is documentation, not a feature.

## [Unreleased]

### Added

- `docs/ARCHITECTURE.md` — the binding contract: non-negotiables, stack, domain
  model, authority model, append-only money rule, sync design, WRAP binding,
  layering, migrations, security posture, and the status-honesty rule.
- Documentation set, all clearly marked as design specifications rather than
  descriptions of running software:
  - `docs/GETTING-STARTED.md` — intended path from clone to first job, with a
    per-step status table.
  - `docs/CONFIGURATION.md` — intended flags and `PROPFIX_*` environment
    variables, each marked with its status.
  - `docs/SYNC.md` — deep protocol specification: HLC stamps, merge rules,
    append-only money, authority, stateless symmetric rounds, envelope
    authentication and its threat table, folder/USB transport, the merge-engine
    seam, and open questions.
  - `docs/WRAP.md` — how PropFix maps onto the WRAP `trades/v0` profile for
    cross-organisation work, including what must never cross the boundary.
  - `docs/INSPECTIONS.md` — templates, append-only findings, and the
    ingoing/outgoing comparison, including the "not captured ingoing" case.
  - `docs/SELFHOST.md` — deployment shape, exposure, backup, and upgrades.
  - `docs/THREAT-MODEL.md` — assets, adversaries, what an attacker gets, and
    seven unmitigated residual risks.
  - `docs/SCREENSHOTS.md` — the shot list and screenshotter plan. No images
    exist and none are faked.
  - `docs/FAQ.md` — starting with "Can I use PropFix today?" ("No").
- `README.md` — with a status banner stating that the product is not usable
  today, and a feature table in which every row is marked *Designed*.
- `site/index.html` and `site/docs.html` — hand-written marketing site and docs
  viewer, zero external fetches (vendored `marked` and `mermaid`, no CDN, no
  web fonts), dark theme with a light mode via `prefers-color-scheme`.
- `scripts/sync-docs.mjs` + `npm run docs:sync` / `npm run docs:check` — copies
  `docs/*.md` into `site/docs/`, removes copies whose source is gone, and fails
  in `--check` mode when the two have diverged.
- `CONTRIBUTING.md` and `SECURITY.md`.

### Changed

- Nothing. There is no prior release of the rebuilt product to change.

### Removed

- The legacy cloud-coupled implementation is being replaced rather than patched.
  Credentials found in the repository history are catalogued in
  `SECURITY-AUDIT.md`, including items still marked unresolved — rebuilding the
  code does not rotate a key.

### Not yet implemented

Listed explicitly so that the absence is a record rather than an omission: the
Go backend, the React frontend, migrations, the HLC oplog, peer sync, folder
transport, WRAP support, inspections, reporting, demo mode, the screenshotter,
and any released artefact.

[Unreleased]: https://github.com/vul-os/propfix/commits/main
