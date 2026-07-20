# Security audit — repository merge

Record of the secret scan performed when four PropFix repositories were merged
into this one, and what was removed. Dated 2026-07-20.

## ⚠️ Action required: revoke these credentials

**Stripping secrets from this repository does not un-expose them.** The
original repositories still exist on GitHub with full history, and anything
committed there must be treated as compromised regardless of what was done
here. Cloning, forking, and GitHub's own caches mean the material may persist
even after the source repositories are deleted.

Two Google Cloud **service-account private keys** were committed in plaintext
and were present at `HEAD` of `propfix-backend-go`:

| File | GCP project | Private key ID |
|---|---|---|
| `keyfile.json` | `propfix` | `d24455062861d89d9e5753eeca9c483a46399c27` |
| `firebase-keyfile.json` | `prop-fix` | `dbf18a7268b14ee19e3d6642ed05ad84a145d673` |

These grant whatever IAM roles were bound to those service accounts. They must
be **revoked in the Google Cloud console**, not merely rotated in code:

1. IAM & Admin → Service Accounts → locate the account in each project.
2. Keys tab → delete the key with the ID above.
3. Review audit logs for use by an unrecognised principal or from an
   unexpected address, covering the period since first commit (2023-07-26).
4. Check for resources created by these accounts — Firestore/Storage writes,
   Cloud Build triggers, billable API usage.

If the projects are dormant or abandoned, deleting the service accounts (or
the projects) is simpler and stronger than key rotation.

## What was removed from history

**Service-account keyfiles** — `keyfile.json` and `firebase-keyfile.json`
removed from every commit in `propfix-backend-go` via `git filter-repo`
(3 blob versions across 297 commits).

**Firebase Web API keys** — three `AIza…` values replaced with
`***REMOVED-FIREBASE-WEB-KEY***` throughout `propfix-frontend-react` history
(16 blobs affected), last seen in `src/contexts/auth.js`.

These are a lower severity: Firebase Web API keys are *public identifiers by
design*, shipped in client bundles and secured by Firebase Security Rules and
API key restrictions rather than by secrecy. They were scrubbed for hygiene.
The meaningful control is that Firebase Security Rules are correctly
restrictive and the keys are domain-restricted — **verify this**, because a
project that relied on the key being unknown is misconfigured.

If any of the three was a Google **Maps** key rather than a Firebase key, an
unrestricted Maps key is directly billable by anyone who finds it and should be
restricted or rotated.

## What was scanned

All reachable blobs under 2 MB across the complete history of all four
repositories, before and after the merge, for:

private keys (`BEGIN … PRIVATE KEY`), GCP service-account JSON, AWS access key
IDs (`AKIA…`), Google API keys (`AIza…`), Stripe live and test keys, GitHub
personal access tokens (`ghp_`, `github_pat_`), Slack tokens (`xox…`),
SendGrid keys (`SG.…`), and Postgres/MongoDB connection strings containing
inline credentials. Filenames were separately matched against `.env`, `*.pem`,
`*.key`, `*.p12`, `*.pfx`, `*keyfile*`, `*credential*`, `id_rsa`, `*.jks`.

A lower-signal pass over the Go backend for hardcoded assignments to
`jwt_secret`, `api_key`, `password`, `secret_key`, `access_token` and
`client_secret` returned nothing.

## Verification

After the merge, the same scan was re-run against the unified history and
returned no matches on any pattern, and no suspicious filenames. The scrub
markers are present, confirming replacement rather than accidental omission.

## Limitations

Stated so the clean result is not over-read:

- **Pattern-based scanning finds known shapes.** A credential with no
  distinctive prefix — a bare password in a config value, a base64 blob, a
  bearer token in a fixture — would not be matched. No commercial scanner
  (`gitleaks`, `trufflehog`) was available in this environment; installing one
  and re-running is worthwhile before the repository is made public.
- **Blobs over 2 MB were skipped** for performance.
- **Only reachable objects were scanned.** Anything unreferenced was excluded
  and is in any case dropped by the rewrite.
- **This audit covers the four merged repositories only** — not deployment
  environments, CI secrets, or any credential that was never committed.
