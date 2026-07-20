-- Epoch 1: identity, tenancy, local auth, replication journal.
--
-- Every replicated table carries org_id, hlc and deleted. org_id is the
-- tenancy boundary (§4.2) and is written from the authenticated session, never
-- from a request body (§11). hlc carries the write's position in the total
-- order so a later sync phase can resolve last-writer-wins without a second
-- source of truth. deleted is a tombstone rather than a DELETE because a row
-- removed on a partitioned node must be able to out-order a concurrent edit;
-- a physical delete would simply be re-created by the peer that never saw it.

CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- The replication journal. Written in the same transaction as the row it
-- describes, so a row can never exist without the op that produced it.
-- author is the Ed25519 public key of the node that minted the op; it is also
-- the HLC tie-break field (§7).
CREATE TABLE oplog (
  hlc        TEXT PRIMARY KEY,
  author     TEXT NOT NULL,
  org_id     TEXT NOT NULL,
  tbl        TEXT NOT NULL,
  row_id     TEXT NOT NULL,
  deleted    INTEGER NOT NULL DEFAULT 0,
  payload    TEXT NOT NULL DEFAULT '',
  cose       TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX idx_oplog_author ON oplog(author, hlc);
CREATE INDEX idx_oplog_row ON oplog(tbl, row_id);

CREATE TABLE organisation (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  hlc        TEXT NOT NULL DEFAULT '',
  deleted    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

-- Local operator accounts. Deliberately NOT replicated: a credential is a
-- property of the machine an operator sits at, and shipping password hashes
-- around a peer mesh widens the blast radius of one stolen tablet to every
-- node in the fleet.
CREATE TABLE app_user (
  id            TEXT PRIMARY KEY,
  org_id        TEXT NOT NULL REFERENCES organisation(id),
  email         TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'manager',
  created_at    TEXT NOT NULL
);
-- Email is unique globally, not per org: a login form has no org field, so a
-- duplicate address would make authentication ambiguous.
CREATE UNIQUE INDEX idx_app_user_email ON app_user(lower(email));

-- Only the SHA-256 of a session token is stored, so a stolen database file
-- yields no usable sessions.
CREATE TABLE session (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES app_user(id),
  org_id     TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
CREATE INDEX idx_session_user ON session(user_id);

-- A person. Staff, contractor or tenant — one table, because the same human is
-- often two of those and duplicating them fragments job history.
CREATE TABLE party (
  id         TEXT PRIMARY KEY,
  org_id     TEXT NOT NULL,
  kind       TEXT NOT NULL DEFAULT 'staff',
  name       TEXT NOT NULL,
  email      TEXT NOT NULL DEFAULT '',
  phone      TEXT NOT NULL DEFAULT '',
  pubkey     TEXT NOT NULL DEFAULT '',
  hlc        TEXT NOT NULL DEFAULT '',
  deleted    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_party_org ON party(org_id, kind);

-- An enrolled sync peer. Discovery is manual (§7): an operator types the URL.
CREATE TABLE peer (
  id           TEXT PRIMARY KEY,
  org_id       TEXT NOT NULL,
  name         TEXT NOT NULL,
  url          TEXT NOT NULL DEFAULT '',
  pubkey       TEXT NOT NULL DEFAULT '',
  enabled      INTEGER NOT NULL DEFAULT 1,
  last_sync_at TEXT NOT NULL DEFAULT '',
  last_status  TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL
);
CREATE INDEX idx_peer_org ON peer(org_id);
