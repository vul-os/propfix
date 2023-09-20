SELECT SUM(hours)
FROM jobs
WHERE organization_id = '{{ .organizationId }}'