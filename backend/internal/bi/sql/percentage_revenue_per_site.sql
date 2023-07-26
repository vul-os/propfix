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
    d.ProductIdentifier,
    p.SiteIdentifier,
    SUM(d.positive_difference_price) AS total_revenue
  FROM filtered_diffs d
  JOIN `scrapers.product_unique` p ON d.ProductIdentifier = p.ProductIdentifier
  GROUP BY d.ProductIdentifier, p.SiteIdentifier
  HAVING SUM(d.positive_difference_price) > 0
)
SELECT 
  r.SiteIdentifier,
  s.Url AS SiteUrl,
  SUM(r.total_revenue) as total_revenue
FROM 
  revenue r
JOIN
  `scrapers.site_unique` s ON r.SiteIdentifier = s.SiteIdentifier
GROUP BY 
  r.SiteIdentifier,
  s.Url
ORDER BY total_revenue DESC;
