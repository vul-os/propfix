SELECT 
    UPPER(j.unit_identifier) AS unit_identifier,
    SUM(j.hours) AS total_hours
FROM 
    jobs j
WHERE 
    j.organization_id = '{{ .organizationId }}'
GROUP BY 
    j.unit_identifier
ORDER BY 
    total_hours DESC;
