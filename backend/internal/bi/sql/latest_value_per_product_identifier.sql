SELECT
  subquery.ProductIdentifier,
  p.Name AS ProductName,
  subquery.Price,
  subquery.MaxQty,
  subquery.TotalValue
FROM (
  SELECT
    subsub.ProductIdentifier,
    subsub.Price,
    subsub.MaxQty,
    subsub.TotalValue
  FROM (
    SELECT
      ProductIdentifier,
      Price,
      MaxQty,
      Price * MaxQty AS TotalValue,
      ROW_NUMBER() OVER (PARTITION BY ProductIdentifier ORDER BY DateCreated DESC) AS rn
    FROM
      `scrapers.datapoint_partitioned`
    WHERE
      MaxQty > 0
  ) AS subsub
  WHERE rn = 1
) AS subquery
JOIN (
  SELECT
    DISTINCT ProductIdentifier,
    Name
  FROM
    `scrapers.product_unique`
) p ON subquery.ProductIdentifier = p.ProductIdentifier
ORDER BY subquery.TotalValue DESC
LIMIT 1000