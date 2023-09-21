SELECT 
    b.building_name,
    SUM(j.hours) AS total_hours
FROM 
    jobs j
JOIN 
    buildings b ON j.building_id = b.id
WHERE 
    j.organization_id = '{{ .organizationId }}'
GROUP BY 
    b.building_name
ORDER BY 
    total_hours DESC;
