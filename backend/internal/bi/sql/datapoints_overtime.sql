SELECT
  DateCreated,
  MaxQty,
  Price
FROM
  `scrapers.data`
WHERE
  ProductIdentifier = '{{ .ProductIdentifier }}'
ORDER BY
  DateCreated;
