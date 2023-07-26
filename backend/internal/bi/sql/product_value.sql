SELECT
  MAX(maxqty * Price) AS current_value
FROM
  `scrapers.datapoint_partitioned`
WHERE
  ProductIdentifier = '{{ .ProductIdentifier }}'
