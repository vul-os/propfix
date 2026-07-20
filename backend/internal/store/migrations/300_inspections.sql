-- Epoch 300: templated inspections and findings.
--
-- inspection carries BOTH building_id and unit_id (§4.2). Reaching the building
-- through the unit would be normal-form-correct and wrong in practice: an
-- inspection of common property has no unit, and the ingoing/outgoing
-- comparison has to be able to scope to a building without a unit existing.
--
-- finding is append-only like the money ledgers. An outgoing inspection that
-- contradicts the ingoing record is the evidence in a deposit dispute; a
-- finding that could be edited after the fact is worth nothing in that
-- argument, so a revision is a new row and the pair is what gets compared.

CREATE TABLE inspection_template (
  id         TEXT PRIMARY KEY,
  org_id     TEXT NOT NULL,
  name       TEXT NOT NULL,
  kind       TEXT NOT NULL DEFAULT 'general',
  hlc        TEXT NOT NULL DEFAULT '',
  deleted    INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_template_org ON inspection_template(org_id);

CREATE TABLE inspection_template_item (
  id          TEXT PRIMARY KEY,
  org_id      TEXT NOT NULL,
  template_id TEXT NOT NULL REFERENCES inspection_template(id),
  section     TEXT NOT NULL DEFAULT '',
  label       TEXT NOT NULL,
  sort        INTEGER NOT NULL DEFAULT 0,
  hlc         TEXT NOT NULL DEFAULT '',
  deleted     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);
CREATE INDEX idx_template_item_template ON inspection_template_item(template_id, sort);

CREATE TABLE inspection (
  id                 TEXT PRIMARY KEY,
  org_id             TEXT NOT NULL,
  building_id        TEXT NOT NULL REFERENCES building(id),
  unit_id            TEXT REFERENCES unit(id),
  template_id        TEXT REFERENCES inspection_template(id),
  kind               TEXT NOT NULL DEFAULT 'routine',
  status             TEXT NOT NULL DEFAULT 'scheduled',
  scheduled_for      TEXT NOT NULL DEFAULT '',
  performed_at       TEXT NOT NULL DEFAULT '',
  inspector_party_id TEXT REFERENCES party(id),
  notes              TEXT NOT NULL DEFAULT '',
  hlc                TEXT NOT NULL DEFAULT '',
  deleted            INTEGER NOT NULL DEFAULT 0,
  created_at         TEXT NOT NULL
);
CREATE INDEX idx_inspection_org ON inspection(org_id, status);
CREATE INDEX idx_inspection_unit ON inspection(unit_id, kind);

CREATE TABLE finding (
  id            TEXT PRIMARY KEY,
  org_id        TEXT NOT NULL,
  inspection_id TEXT NOT NULL REFERENCES inspection(id),
  item_id       TEXT REFERENCES inspection_template_item(id),
  label         TEXT NOT NULL DEFAULT '',
  condition     TEXT NOT NULL DEFAULT 'ok',
  comment       TEXT NOT NULL DEFAULT '',
  photo_refs    TEXT NOT NULL DEFAULT '',
  hlc           TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL
);
CREATE INDEX idx_finding_inspection ON finding(inspection_id);

-- Content-addressed blob references. The hash is the identity, so the same
-- photo synced from two tablets is one attachment rather than two.
CREATE TABLE attachment (
  id         TEXT PRIMARY KEY,
  org_id     TEXT NOT NULL,
  sha256     TEXT NOT NULL,
  filename   TEXT NOT NULL DEFAULT '',
  media_type TEXT NOT NULL DEFAULT '',
  bytes      INTEGER NOT NULL DEFAULT 0,
  hlc        TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX idx_attachment_org_hash ON attachment(org_id, sha256);
