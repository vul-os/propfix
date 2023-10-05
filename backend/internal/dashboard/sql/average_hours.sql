SELECT AVG(hours) AS average_hours
FROM jobs
WHERE organization_id = '{{ .organizationId }}'
