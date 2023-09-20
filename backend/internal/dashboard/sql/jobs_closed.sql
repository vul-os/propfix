SELECT COUNT(*)
FROM jobs
WHERE closed_at != TIMESTAMP '0001-01-01 00:00:00.000'
AND organization_id = '{{ .organizationId }}'