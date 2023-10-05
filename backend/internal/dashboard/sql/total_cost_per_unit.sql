SELECT 
    UPPER(j.unit_identifier) AS unit_identifier,
    SUM(j.cost) AS total_cost
FROM 
    jobs j
WHERE 
    j.organization_id = '{{ .organizationId }}'
GROUP BY 
    j.unit_identifier
ORDER BY 
    total_cost DESC;
