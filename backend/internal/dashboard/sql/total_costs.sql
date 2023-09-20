SELECT SUM(cost)
FROM jobs
WHERE organization_id = '{{ .organizationId }}'