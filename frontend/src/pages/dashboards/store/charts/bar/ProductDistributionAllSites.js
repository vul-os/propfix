const DATA_INDEX = "TotalValue";
const LABELS_INDEX = "ProductName";
const PRODUCT_IDENTIFIER_INDEX = "ProductIdentifier";

export function generateChartConfigBar(responseData, displayName, theme, navigate) {
  const labels = responseData[LABELS_INDEX];
  const productIdentifiers = responseData[PRODUCT_IDENTIFIER_INDEX];

  const datasets = [
    {
      label: displayName,
      data: responseData[DATA_INDEX],
      backgroundColor: theme.palette.primary.main,
      barPercentage: 0.5,
      categoryPercentage: 1.0
    },
  ];

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
          speed: 0.1,
          threshold: 10,
        },
        zoom: {
          enabled: true,
          mode: 'x',
          speed: 0.1,
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          drag: {
            enabled: true,
            threshold: 10,
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `R${value.toFixed(0)}`,
        },
        border: {
          dash: [2, 4],
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
    },
    tooltips: {
      intersect: false
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
  };

  const onEvent = (index) => {
    console.log(productIdentifiers[index]);
    navigate(`/products/${productIdentifiers[index]}`);
  };
  const eventType = 'onDoubleClick';

  return { data, options, onEvent, eventType };
}

export const ChartOptionsBar = {
  title: "Product Distribution",
  subheader: "(+43%) than last year",
  name: "latest_value_per_product_identifier",
  displayName: 'Sales',
  templates: {
    date_start: '2023-01-01',
    date_end: '2023-06-07'
  },
  type: 'bar',
  generateChartConfig: generateChartConfigBar,
};
