SELECT
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
