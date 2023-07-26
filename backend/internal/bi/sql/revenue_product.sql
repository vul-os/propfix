WITH diffs AS (
  SELECT
    DateCreated,
    ProductIdentifier,
    maxqty - IFNULL(LAG(maxqty) OVER (PARTITION BY ProductIdentifier ORDER BY DateCreated), 0) AS difference
  FROM
    `scrapers.datapoint_partitioned`
), the_query AS (
  SELECT
    DateCreated,
    ProductIdentifier,
    -1 * SUM(difference) AS Units_Sold
  FROM
    diffs
  WHERE difference < 0
    AND ProductIdentifier = '{{ .ProductIdentifier }}'
  GROUP BY ProductIdentifier, DateCreated
), revenue_query AS (
  SELECT
    t.ProductIdentifier,
    SUM(t.Units_Sold * p.Price) AS Total_Revenue
  FROM
    the_query t
  JOIN
    `scrapers.datapoint_partitioned` p ON t.ProductIdentifier = p.ProductIdentifier AND t.DateCreated = p.DateCreated

  GROUP BY t.ProductIdentifier
)
SELECT DISTINCT
  r.ProductIdentifier,
  p.Name AS ProductName,
  r.Total_Revenue
FROM
  revenue_query r
JOIN
  `scrapers.product_unique` p ON r.ProductIdentifier = p.ProductIdentifier
ORDER BY
  r.Total_Revenue DESC, r.ProductIdentifier
LIMIT 25
