-- Epoch 300 follow-up 1: optionally link an inspection to a job.
--
-- Two directions matter and both are covered by one nullable column:
--   - an inspection scheduled to verify a job's work is done ("confirm the
--     leak repair before the tenant moves back in");
--   - a job raised because a walk found something wrong, so the remediation
--     cost lands next to the finding that prompted it (INSPECTIONS.md §6).
--
-- Nullable and unindexed-unique on purpose: most inspections name no job at
-- all, and there is no rule limiting a job to one inspection.

ALTER TABLE inspection ADD COLUMN job_id TEXT REFERENCES job(id);
CREATE INDEX idx_inspection_job ON inspection(job_id);
