SELECT COUNT(*)
FROM jobs
where organization_id = '{{ .organizationId }}'