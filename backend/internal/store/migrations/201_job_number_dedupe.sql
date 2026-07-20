-- Epoch 200 follow-up 1: job numbers stay collision-free when two nodes
-- diverge offline against the same building.
--
-- nextJobNumber (repo/job.go) allocates a building's next number purely
-- locally, with no coordination, by design (ARCHITECTURE.md §5): the
-- building's owning organisation is the single legitimate writer, so a
-- number can be minted with no lock and no round trip. But "single legitimate
-- writer" is an organisational fact, not a mechanical one — the same
-- organisation's office node and field tablet are both allowed to raise jobs,
-- and if both are offline from each other when each raises the FIRST job
-- against a building neither has synced yet, both mint number 1. The old
-- UNIQUE(building_id, number) index treated that as a corruption and failed
-- the whole sync round rather than the one op.
--
-- The fix: numbers stay small, dense and human-meaningful for the ordinary
-- case (one contributing node per building — the index above stays in place,
-- unique in practice, just no longer enforced as a hard constraint), and are
-- reconciled automatically, exactly once, only at the moment a genuine
-- collision is inserted — never speculatively, never for a job with no
-- conflict, and never on an ordinary status or assignment update. See
-- docs/SYNC.md "Job numbers under divergence" for the full reasoning and its
-- one acknowledged limitation.

DROP INDEX idx_job_building_number;
CREATE INDEX idx_job_building_number ON job(building_id, number);

-- The stable arbitration key. Deliberately its own column rather than reusing
-- job.hlc: job.hlc is overwritten by every status change and assignment
-- (repo/job.go's SetJobStatus, AssignJob), so it stops meaning "when this job
-- was created" the moment anyone touches it. Arbitrating a collision on a
-- value that can move after the fact would let an unrelated status change,
-- made on one node before it has even heard of the colliding job, change
-- which side gets renumbered depending on nothing more meaningful than sync
-- timing. created_hlc is written once, by the trigger below, and never again.
--
-- Nullable, not NOT NULL: sync/apply.go's generic materialiser inserts every
-- column of this table from the replicated JSON payload via json_extract,
-- and the payload (a marshalled domain.Job) has no "created_hlc" key, so a
-- NOT NULL column here would fail every single remote job insert with a
-- constraint error. The trigger fills in the real value immediately
-- afterward, in the same statement's execution, before anything else can
-- observe the row.
ALTER TABLE job ADD COLUMN created_hlc TEXT;

-- Backfill: every job that already exists predates this migration, so it was
-- (by construction — this is the bug being fixed) never party to an
-- unresolved collision, and its own hlc is still its creation stamp.
UPDATE job SET created_hlc = hlc WHERE created_hlc IS NULL;

CREATE TRIGGER trg_job_number_dedupe
AFTER INSERT ON job
FOR EACH ROW
BEGIN
  -- NEW.hlc is the inserting op's own HLC, always — sync/apply.go sets the
  -- hlc column from the Op itself, never from the payload (see its doc
  -- comment), and a local write (repo/job.go's CreateJob) sets it from the
  -- same store.Journal call that mints the row. So NEW.hlc is this job's true
  -- creation moment whether the row arrived locally or through replay, and
  -- this trigger only ever fires once per row: it is AFTER INSERT, and
  -- repo/job.go's later writes to an existing job (SetJobStatus, AssignJob)
  -- are plain UPDATEs, not inserts, so they never re-fire it. The upsert
  -- sync/apply.go uses to materialise a remote update (INSERT ... ON
  -- CONFLICT(id) DO UPDATE) is likewise counted as an UPDATE, not an INSERT,
  -- whenever the conflict path is taken — SQLite fires UPDATE triggers for
  -- that branch, not INSERT ones.
  UPDATE job SET created_hlc = NEW.hlc WHERE id = NEW.id;

  -- If this insert collides with a row that already claims the same number
  -- in the same building, the causally LATER of the two — by the creation
  -- stamp just recorded, the same tie-break this system uses everywhere else
  -- (ARCHITECTURE.md §7) — is bumped to a fresh number for the building.
  -- "Fresh" is always collision-free by construction: one more than the
  -- current maximum can, by definition, not already be held by anything in
  -- that building.
  --
  -- This can only fire when two nodes each allocated the same number for the
  -- same building while both were offline from each other (§5). Every peer
  -- that ends up holding both rows compares the same two immutable creation
  -- stamps and so bumps the same job to the same number, regardless of which
  -- order the two rows reached it in — the pairwise case converges exactly
  -- like every other replicated write in this system.
  --
  -- Acknowledged limitation: for three or more nodes that each independently
  -- raise the FIRST job against the very same, never-before-synced building
  -- while all mutually offline, the specific number each "losing" job is
  -- bumped to can depend on the order the rows arrive at a given peer, so
  -- different peers are not guaranteed to land on identical numbers for the
  -- same job in that scenario (they are still guaranteed distinct, and still
  -- guaranteed not to error). Two-way divergence — one office node and one
  -- field device, the case this fix targets — always converges identically.
  UPDATE job
     SET number = (SELECT IFNULL(MAX(number), 0) + 1 FROM job WHERE building_id = NEW.building_id)
   WHERE id = (
     SELECT id FROM job
      WHERE building_id = NEW.building_id AND number = NEW.number
      ORDER BY created_hlc DESC, id DESC
      LIMIT 1
   )
   AND (
     SELECT COUNT(*) FROM job WHERE building_id = NEW.building_id AND number = NEW.number
   ) > 1;
END;
