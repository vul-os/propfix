WITH diffs AS (
  SELECT
    DateCreated,
    ProductIdentifier,
    Price,
    maxqty - LAG(maxqty) OVER (PARTITION BY ProductIdentifier ORDER BY DateCreated) AS difference
  FROM
    `scrapers.datapoint_raw`
), filtered_diffs AS (
  SELECT
    ProductIdentifier,
    CASE
      WHEN difference > 0 THEN 0
      ELSE -difference * Price
    END AS positive_difference_price
  FROM diffs
  WHERE difference IS NOT NULL
), revenue AS (
  SELECT
    ProductIdentifier,
    SUM(positive_difference_price) AS total_revenue
  FROM filtered_diffs
  GROUP BY ProductIdentifier
  HAVING SUM(positive_difference_price) > 0
), distinct_products AS (
  SELECT DISTINCT
    ProductIdentifier
  FROM `scrapers.datapoint_partitioned`
),
period_1_sales AS (
  SELECT 
    d.ProductIdentifier, 
    SUM(-1 * d.difference * d.Price) AS revenue
  FROM 
    (SELECT
       DateCreated,
       ProductIdentifier,
       IFNULL(maxqty - LAG(maxqty) OVER (PARTITION BY ProductIdentifier ORDER BY DateCreated), 0) AS difference,
       Price
     FROM `scrapers.datapoint_partitioned`
    ) d
  WHERE 
    d.difference < 0 
    AND DATE_TRUNC(DATE(d.DateCreated), DAY) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 8 DAY)
  GROUP BY d.ProductIdentifier
), 
period_2_sales AS (
  SELECT 
    d.ProductIdentifier, 
    SUM(-1 * d.difference * d.Price) AS revenue
  FROM 
    (SELECT
       DateCreated,
       ProductIdentifier,
       IFNULL(maxqty - LAG(maxqty) OVER (PARTITION BY ProductIdentifier ORDER BY DateCreated), 0) AS difference,
       Price
     FROM `scrapers.datapoint_partitioned`
    ) d
  WHERE 
    d.difference < 0 
    AND DATE_TRUNC(DATE(d.DateCreated), DAY) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE()
  GROUP BY d.ProductIdentifier
),
period_1_qty AS (
  SELECT 
    d.ProductIdentifier, 
    SUM(-1 * d.difference) AS qty
  FROM 
    (SELECT
       DateCreated,
       ProductIdentifier,
       IFNULL(maxqty - LAG(maxqty) OVER (PARTITION BY ProductIdentifier ORDER BY DateCreated), 0) AS difference
     FROM `scrapers.datapoint_partitioned`
    ) d
  WHERE 
    d.difference < 0 
    AND DATE_TRUNC(DATE(d.DateCreated), DAY) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 8 DAY)
  GROUP BY d.ProductIdentifier
), 
period_2_qty AS (
  SELECT 
    d.ProductIdentifier, 
    SUM(-1 * d.difference) AS qty
  FROM 
    (SELECT
       DateCreated,
       ProductIdentifier,
       IFNULL(maxqty - LAG(maxqty) OVER (PARTITION BY ProductIdentifier ORDER BY DateCreated), 0) AS difference
     FROM `scrapers.datapoint_partitioned`
    ) d
  WHERE 
    d.difference < 0 
    AND DATE_TRUNC(DATE(d.DateCreated), DAY) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE()
  GROUP BY d.ProductIdentifier
),
period_1_rank AS (
  SELECT 
    ProductIdentifier, 
    ROW_NUMBER() OVER (ORDER BY revenue ASC) AS row_number,
    revenue AS current_period_revenue
  FROM period_1_sales
),
period_2_rank AS (
  SELECT 
    ProductIdentifier, 
    RANK() OVER (ORDER BY revenue ASC) AS rank,
    revenue AS current_period_revenue
  FROM period_2_sales
),
current_values AS (
  SELECT
    ProductIdentifier,
    Price AS current_price,
    maxqty AS current_maxqty
  FROM (
    SELECT 
      ProductIdentifier,
      Price,
      maxqty,
      ROW_NUMBER() OVER (PARTITION BY ProductIdentifier ORDER BY DateCreated DESC) as rn
    FROM
      `scrapers.datapoint_partitioned`
  ) 
  WHERE rn = 1
),
rank_change AS (
  SELECT
    p2.ProductIdentifier,
    CASE
      WHEN p1.row_number IS NULL THEN 0
      ELSE p2.rank - p1.row_number
    END AS RankChange
  FROM period_2_rank p2
  LEFT JOIN period_1_rank p1 ON p2.ProductIdentifier = p1.ProductIdentifier
)
SELECT 
  dp.ProductIdentifier, 
  RANK() OVER (ORDER BY IFNULL(p2.rank, 0) DESC) AS Rank,
  IFNULL(p2.current_period_revenue, 0) AS Revenue,
  IFNULL(p2.current_period_revenue, 0) AS RevenueChange,
  IFNULL(q2.qty, 0) - IFNULL(q1.qty, 0) AS NegativeDifference,
  IFNULL(rc.RankChange, 0) AS RankChange,
  ROUND(IFNULL( (IFNULL(p2.current_period_revenue, 0) - IFNULL(p1.current_period_revenue, 0))
     / NULLIF(ABS(IFNULL(p2.current_period_revenue, 0)), 0) * 100, 0)) AS PercentageChange,
  c.current_price AS Price,
  c.current_maxqty AS MaxQty,
  c.current_price * c.current_maxqty AS SalesValue,
  p.Name AS ProductName,
  p.ImageUrls AS ImageUrls,
  p.URL AS ProductUrl
FROM 
  `scrapers.site_permissions` sp
JOIN
  `scrapers.product_unique` p ON sp.siteid = p.siteIdentifier
JOIN
  distinct_products dp ON dp.ProductIdentifier = p.ProductIdentifier
LEFT JOIN 
  period_1_rank p1 ON dp.ProductIdentifier = p1.ProductIdentifier
LEFT JOIN 
  period_2_rank p2 ON dp.ProductIdentifier = p2.ProductIdentifier
LEFT JOIN
  period_1_qty q1 ON dp.ProductIdentifier = q1.ProductIdentifier
LEFT JOIN
  period_2_qty q2 ON dp.ProductIdentifier = q2.ProductIdentifier
LEFT JOIN
  current_values c ON dp.ProductIdentifier = c.ProductIdentifier
LEFT JOIN
  rank_change rc ON dp.ProductIdentifier = rc.ProductIdentifier
WHERE 
  c.current_maxqty > 0 
  AND p.Name IS NOT NULL
  AND sp.userId = "{{ .userId }}"
ORDER BY Rank ASC;
