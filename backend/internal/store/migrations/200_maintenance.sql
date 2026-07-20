-- Epoch 200: maintenance jobs and their append-only ledgers.
--
-- There is no cost column on job, and there never will be one (§6). A job's
-- spend is SUM(amount_minor) over cost_entry at read time. If two people record
-- spend on the same job while partitioned, union merge makes the amounts add;
-- a stored counter would keep whichever write landed last and lose the other
-- silently, with no error and no way to notice until the numbers were wrong.
-- The same reasoning applies to time_entry.minutes.
--
-- Corrections are new rows with a negative amount. That is why there is no
-- UPDATE path and no updated_at column on either ledger: the audit trail is
-- complete by construction rather than by discipline.

-- Job numbers are allocated per building because the building is the authority
-- (§5). Namespacing the sequence is what removes coordination: two nodes
-- managing different buildings never contend, and one building has exactly one
-- legitimate writer, so no lock or consensus round is needed anywhere.
CREATE TABLE job_number_seq (
  building_id TEXT PRIMARY KEY REFERENCES building(id),
  next        INTEGER NOT NULL
);

CREATE TABLE job (
  id                TEXT PRIMARY KEY,
  org_id            TEXT NOT NULL,
  building_id       TEXT NOT NULL REFERENCES building(id),
  unit_id           TEXT REFERENCES unit(id),
  number            INTEGER NOT NULL,
  title             TEXT NOT NULL,
  description       TEXT NOT NULL DEFAULT '',
  status            TEXT NOT NULL DEFAULT 'reported',
  priority          TEXT NOT NULL DEFAULT 'normal',
  category          TEXT NOT NULL DEFAULT '',
  assignee_party_id TEXT REFERENCES party(id),
  reporter_party_id TEXT REFERENCES party(id),
  opened_at         TEXT NOT NULL,
  closed_at         TEXT NOT NULL DEFAULT '',
  hlc               TEXT NOT NULL DEFAULT '',
  deleted           INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL
);
CREATE UNIQUE INDEX idx_job_building_number ON job(building_id, number);
CREATE INDEX idx_job_org_status ON job(org_id, status);
CREATE INDEX idx_job_unit ON job(unit_id);

-- One thread serves internal notes and tenant communication, gated by
-- visibility (§4.3). A tenant sees only visibility='public'. Keeping them in
-- one table means a manager never has to decide which of two threads to look
-- at to know what happened.
CREATE TABLE job_event (
  id             TEXT PRIMARY KEY,
  org_id         TEXT NOT NULL,
  job_id         TEXT NOT NULL REFERENCES job(id),
  kind           TEXT NOT NULL,
  body           TEXT NOT NULL DEFAULT '',
  actor_party_id TEXT REFERENCES party(id),
  visibility     TEXT NOT NULL DEFAULT 'internal',
  hlc            TEXT NOT NULL DEFAULT '',
  created_at     TEXT NOT NULL
);
CREATE INDEX idx_job_event_job ON job_event(job_id, created_at);

-- amount_minor is int64 minor units. Floats never touch money (§3): 0.1 + 0.2
-- is not 0.3, and a rounding drift in a landlord's recoverable-cost schedule is
-- a dispute, not a rounding error.
CREATE TABLE cost_entry (
  id          TEXT PRIMARY KEY,
  org_id      TEXT NOT NULL,
  job_id      TEXT NOT NULL REFERENCES job(id),
  kind        TEXT NOT NULL DEFAULT 'labour',
  description TEXT NOT NULL DEFAULT '',
  amount_minor INTEGER NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'ZAR',
  party_id    TEXT REFERENCES party(id),
  hlc         TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL
);
CREATE INDEX idx_cost_entry_job ON cost_entry(job_id);
CREATE INDEX idx_cost_entry_org ON cost_entry(org_id);

CREATE TABLE time_entry (
  id         TEXT PRIMARY KEY,
  org_id     TEXT NOT NULL,
  job_id     TEXT NOT NULL REFERENCES job(id),
  minutes    INTEGER NOT NULL,
  note       TEXT NOT NULL DEFAULT '',
  party_id   TEXT REFERENCES party(id),
  hlc        TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX idx_time_entry_job ON time_entry(job_id);
CREATE INDEX idx_time_entry_org ON time_entry(org_id);
