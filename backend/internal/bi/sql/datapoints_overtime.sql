SELECT
  DateCreated,
  MaxQty,
  Price
FROM
  `scrapers.datapoint_raw`
WHERE
  ProductIdentifier = '{{ .ProductIdentifier }}'
ORDER BY
  DateCreated;
