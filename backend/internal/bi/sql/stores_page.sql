WITH period_1_sales AS (
  SELECT 
    ps.SiteIdentifier,
    SUM(-1 * dp.difference * dp.Price) AS revenue
  FROM 
    (SELECT
       DateCreated,
       ProductIdentifier,
       IFNULL(maxqty - LAG(maxqty) OVER (PARTITION BY ProductIdentifier ORDER BY DateCreated), 0) AS difference,
       Price
     FROM `scrapers.datapoint_partitioned`
    ) dp
  JOIN (
    SELECT DISTINCT
      ProductIdentifier,
      SiteIdentifier
    FROM `scrapers.product_unique`
  ) ps ON dp.ProductIdentifier = ps.ProductIdentifier
  WHERE 
    dp.difference < 0
    AND DATE_TRUNC(DATE(dp.DateCreated), DAY) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND CURRENT_DATE()
  GROUP BY ps.SiteIdentifier
),
period_2_sales AS (
  SELECT 
    ps.SiteIdentifier,
    SUM(-1 * dp.difference * dp.Price) AS revenue
  FROM 
    (SELECT
       DateCreated,
       ProductIdentifier,
       IFNULL(maxqty - LAG(maxqty) OVER (PARTITION BY ProductIdentifier ORDER BY DateCreated), 0) AS difference,
       Price
     FROM `scrapers.datapoint_partitioned`
    ) dp
  JOIN (
    SELECT DISTINCT
      ProductIdentifier,
      SiteIdentifier
    FROM `scrapers.product_unique`
  ) ps ON dp.ProductIdentifier = ps.ProductIdentifier
  WHERE 
    dp.difference < 0
    AND DATE_TRUNC(DATE(dp.DateCreated), DAY) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 8 DAY)
  GROUP BY ps.SiteIdentifier
),
period_1_rank AS (
  SELECT 
    SiteIdentifier,
    revenue,
    RANK() OVER (ORDER BY revenue DESC) AS rank
  FROM period_1_sales
),
period_2_rank AS (
  SELECT 
    SiteIdentifier,
    revenue,
    RANK() OVER (ORDER BY revenue DESC) AS rank
  FROM period_2_sales
),
product_counts AS (
  SELECT
    pu.SiteIdentifier,
    COUNT(DISTINCT pu.ProductIdentifier) AS ProductCount
  FROM `scrapers.product_unique` pu
  WHERE EXISTS (
    SELECT 1 FROM `scrapers.datapoint_partitioned` dp
    WHERE dp.ProductIdentifier = pu.ProductIdentifier
    AND dp.maxqty > 0
  )
  GROUP BY pu.SiteIdentifier
),
product_values AS (
  SELECT
    pu.SiteIdentifier,
    SUM(dp.MaxQty * dp.Price) AS TotalValue
  FROM `scrapers.product_unique` pu
  JOIN (
    SELECT 
      ProductIdentifier,
      MaxQty,
      Price
    FROM (
      SELECT 
        ProductIdentifier,
        MaxQty,
        Price,
        ROW_NUMBER() OVER (PARTITION BY ProductIdentifier ORDER BY DateCreated DESC) AS rn
      FROM `scrapers.datapoint_partitioned`
      WHERE MaxQty > 0
    ) t
    WHERE rn = 1
  ) dp ON pu.ProductIdentifier = dp.ProductIdentifier
  GROUP BY pu.SiteIdentifier
)

SELECT 
  su.SiteIdentifier, 
  su.Name AS SiteName,
  su.Url AS SiteUrl,
  su.Image AS SiteImage,
  IFNULL(p2.revenue, 0) AS Period2Revenue,
  IFNULL(p1.revenue, 0) AS Period1Revenue,
  IFNULL(p1.revenue, 0) - IFNULL(p2.revenue, 0) AS RevenueChange,
  IFNULL(p1.rank, 0) AS Period1Rank,
  IFNULL(p2.rank, 0) AS Period2Rank,
  IFNULL(pc.ProductCount, 0) AS ProductCount,
  IFNULL(pv.TotalValue, 0) AS TotalValue
FROM 
  `scrapers.site_unique` su
LEFT JOIN 
  period_1_rank p1 ON su.SiteIdentifier = p1.SiteIdentifier
LEFT JOIN 
  period_2_rank p2 ON su.SiteIdentifier = p2.SiteIdentifier
LEFT JOIN 
  product_counts pc ON su.SiteIdentifier = pc.SiteIdentifier
LEFT JOIN 
  product_values pv ON su.SiteIdentifier = pv.SiteIdentifier
ORDER BY RevenueChange DESC;
