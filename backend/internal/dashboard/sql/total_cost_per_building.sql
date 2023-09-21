SELECT 
    b.building_name,
    SUM(j.cost) AS total_cost
FROM 
    jobs j
JOIN 
    buildings b ON j.building_id = b.id
WHERE 
    j.organization_id = '{{ .organizationId }}'
GROUP BY 
    b.building_name
ORDER BY 
    total_cost DESC;
