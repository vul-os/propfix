SELECT
  p.Name AS ProductName,
  p.ImageURLs AS ImageURLs,
  d.Price,
  d.maxqty AS MaxQty
FROM
  `scrapers.product_unique` p
JOIN (
  SELECT
    ProductIdentifier,
    Price,
    maxqty,
    ROW_NUMBER() OVER (PARTITION BY ProductIdentifier ORDER BY DateCreated DESC) AS rn
  FROM
    `scrapers.datapoint_partitioned`
) d ON p.ProductIdentifier = d.ProductIdentifier AND d.rn = 1
WHERE
  p.ProductIdentifier = '{{ .ProductIdentifier}}'
