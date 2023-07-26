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
)
SELECT 
  r.ProductIdentifier,
  p.Name AS ProductName,
  r.total_revenue
FROM 
  revenue r
JOIN
  `scrapers.product_unique` p ON r.ProductIdentifier = p.ProductIdentifier
ORDER BY r.total_revenue DESC;
