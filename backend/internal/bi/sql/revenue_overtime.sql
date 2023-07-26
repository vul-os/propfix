WITH diffs AS (
  SELECT
    DATE_TRUNC(DateCreated, DAY) AS DateCreated,
    ProductIdentifier,
    maxqty - LAG(maxqty) OVER (PARTITION BY ProductIdentifier ORDER BY DateCreated) AS difference
  FROM
    `scrapers.datapoint_raw`
  WHERE
    {{ if .ProductIdentifier }}
    ProductIdentifier = '{{ .ProductIdentifier }}'
    AND
    {{ end }}
    DateCreated >= TIMESTAMP('{{ .date_start }}')
    AND DateCreated <= TIMESTAMP('{{ .date_end }}')
), the_query AS (
  SELECT
    DateCreated,
    ProductIdentifier,
    -1 * SUM(difference) AS Units_Sold
  FROM
    diffs
  WHERE difference < 0
  GROUP BY ProductIdentifier, DateCreated
), revenue_query AS (
  SELECT
    t.ProductIdentifier,
    t.DateCreated,
    SUM(t.Units_Sold * p.Price) AS Total_Revenue
  FROM
    the_query t
  JOIN
    `scrapers.datapoint_raw` p ON t.ProductIdentifier = p.ProductIdentifier 
  GROUP BY t.ProductIdentifier, t.DateCreated
)
SELECT
  r.ProductIdentifier,
  p.Name AS ProductName,
  r.DateCreated,
  r.Total_Revenue
FROM
  revenue_query r
JOIN
  `scrapers.product_unique` p ON r.ProductIdentifier = p.ProductIdentifier
WHERE
  r.Total_Revenue > 0
ORDER BY
  r.DateCreated ASC, r.Total_Revenue DESC, r.ProductIdentifier
LIMIT 1000;
