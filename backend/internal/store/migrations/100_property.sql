-- Epoch 100: the property hierarchy.
--
-- unit is a real table, and this is the whole point of the epoch. The legacy
-- system kept the unit as free text on the job and grouped its analytics by
-- that text, so "Flat 3A", "3A" and "flat 3a" became three units and the
-- per-unit cost reporting — the product's main analytical claim — was quietly
-- wrong (§4.1). The UNIQUE(building_id, key) index below is what makes that
-- failure impossible to reintroduce: the normalised key is the identity, the
-- typed label is only for display.

CREATE TABLE building (
  id          TEXT PRIMARY KEY,
  org_id      TEXT NOT NULL,
  name        TEXT NOT NULL,
  address     TEXT NOT NULL DEFAULT '',
  lat         REAL,
  lon         REAL,
  unit_scheme TEXT NOT NULL DEFAULT '',
  hlc         TEXT NOT NULL DEFAULT '',
  deleted     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);
CREATE INDEX idx_building_org ON building(org_id);

CREATE TABLE unit (
  id          TEXT PRIMARY KEY,
  org_id      TEXT NOT NULL,
  building_id TEXT NOT NULL REFERENCES building(id),
  key         TEXT NOT NULL,
  label       TEXT NOT NULL,
  hlc         TEXT NOT NULL DEFAULT '',
  deleted     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL
);
CREATE UNIQUE INDEX idx_unit_building_key ON unit(building_id, key);
CREATE INDEX idx_unit_org ON unit(org_id);
