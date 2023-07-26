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
  WHERE
    difference < 0
    AND ProductIdentifier = '{{ .ProductIdentifier }}'
    AND DATE_TRUNC(DateCreated, DAY) BETWEEN PARSE_TIMESTAMP('%Y-%m-%d', '{{ .date_start }}') AND PARSE_TIMESTAMP('%Y-%m-%d', '{{ .date_end }}')
  GROUP BY
    ProductIdentifier, DateCreated
), revenue_query AS (
  SELECT
    ProductIdentifier,
    SUM(Units_Sold * Price) AS Total_Revenue
  FROM
    the_query
  JOIN
    `scrapers.datapoint_partitioned` USING (ProductIdentifier, DateCreated)
  GROUP BY
    ProductIdentifier
)
SELECT
  Total_Revenue
FROM
  revenue_query;
