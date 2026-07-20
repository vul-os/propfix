# Security policy

## Reporting a vulnerability

**Please report vulnerabilities privately. Do not open a public issue.**

Use GitHub's private vulnerability reporting on
[`vul-os/propfix`](https://github.com/vul-os/propfix/security/advisories/new),
or contact the maintainers privately if that is unavailable.

Please include:

- what the issue is and how to reproduce it;
- the commit or version you tested;
- the impact as you see it, and any mitigation you already know of.

You will get an acknowledgement. If the report is valid you will be credited in
the fix unless you would rather not be.

## Supported versions

| Version | Supported |
|---|---|
| `main` | Yes — the rebuild in progress |
| Legacy pre-rebuild implementation | **No.** Not maintained, not patched, being replaced. |

There is no released, runnable version of the rebuilt product yet — see
[`CHANGELOG.md`](CHANGELOG.md). Reports against the design in
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and
[`docs/THREAT-MODEL.md`](docs/THREAT-MODEL.md) are welcome and useful: a design
flaw found now is cheaper than one found later.

## Scope

**In scope**

- Tenant / organisation isolation failures — anything where scoping could be
  influenced by a client-supplied value rather than derived from the
  authenticated identity.
- Tenant visibility failures — any path that returns job events without applying
  the `visibility = 'public'` filter. That flag is a security control, not a UI
  preference.
- Sync authentication: signature verification, the freshness window, the replay
  nonce cache, key confusion between presented and recorded keys, and anything
  that lets an unenrolled peer through.
- Secret handling: secrets appearing in argv, logs, `String()`/`Debug` output,
  or API responses.
- Unexpected outbound network calls from a default install.
- File permissions on the database, `node.key`, or attachments.

**Known and documented, not a finding**

These are recorded decisions, explained in
[`docs/THREAT-MODEL.md`](docs/THREAT-MODEL.md) §6. A report that restates one
without new information will be closed with a pointer there — though an argument
that a decision is *wrong* is a legitimate issue, just not a vulnerability
report.

- The database is **not encrypted at rest**. Full-disk encryption is the correct
  layer.
- Sync payloads are **authenticated but not encrypted**. Confidentiality is
  delegated to the transport you choose.
- A relay or tunnel in the path is a **content-visible L7 hop**.
- **A full peer replicates the dataset.** Enrolment is trust.
- **Root on the box is game over.** PropFix does not defend against its own host.

## Legacy credential exposure

[`SECURITY-AUDIT.md`](SECURITY-AUDIT.md) catalogues credentials found in the
repository history of the legacy implementation, including items marked
unresolved. **Rebuilding the code does not rotate a key.** If you operate
anything referenced there, read it directly rather than assuming the rebuild
supersedes it.

## Disclosure

Coordinated disclosure. Please give us a reasonable window to ship a fix before
publishing. If a report is not acted on in reasonable time, publishing is your
call and we will not object to it.
