SELECT 
    DATE(created_at) AS job_date,
    COUNT(*) AS num_jobs,
    SUM(CASE WHEN DATE(closed_at) = DATE(created_at) THEN 1 ELSE 0 END) AS jobs_closed
FROM 
    jobs
WHERE 
    organization_id = '{{ .organizationId }}'
GROUP BY 
    job_date
ORDER BY 
    job_date;
