SELECT 
    DATE(created_at) AS job_date,
    SUM(hours) AS total_hours,
    SUM(cost) AS total_cost
FROM 
    jobs
WHERE 
    organization_id = '{{ .organizationId }}'
GROUP BY 
    job_date
ORDER BY 
    job_date;
