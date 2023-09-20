SELECT 
    b.building_name as building_name,
    COUNT(j.id) AS num_jobs  -- Assuming 'job_id' is a column in the 'jobs' table.
FROM 
    buildings b
LEFT JOIN 
    jobs j ON b.id = j.building_id  -- Joining on the buildingId.
WHERE 
    j.organization_id = '{{ .organizationId }}'
GROUP BY 
    b.building_name
ORDER BY 
    num_jobs DESC;  -- Ordered by the number of jobs, you can change this if needed.
