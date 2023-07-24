const DATA_INDEX = "Total_Revenue";
const LABELS_INDEX = "DateCreated";
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
      categoryPercentage: 1.0,
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
        display: false,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
          speed: 0.1, // could be a value between 0.01 and 1 to reduce pan sensitivity
          threshold: 10, // minimum number of pixels that the cursor must move before panning
        },
        zoom: {
          enabled: true,
          mode: 'x',
          speed: 0.1, // could be a value between 0.01 and 1 to reduce zoom sensitivity
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          drag: {
            enabled: true,
            threshold: 10, // minimum number of pixels that the cursor must move before zooming
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
          color: theme.palette.secondary.main,
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
      intersect: false, // Add this..
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const onEvent = (index) => {
    console.log(productIdentifiers[index]);
    navigate(`/product/${productIdentifiers[index]}`);
  };

  const eventType = 'onDoubleClick';

  return { data, options, onEvent, eventType };
}

export const ChartOptionsBar = {
  title: "Revenue Over Time",
  subheader: "(+43%) than last year",
  name: "revenue_overtime",
  displayName: 'Sales',
  templates: {},
  type: 'bar',
  generateChartConfig: generateChartConfigBar, // or generateChartDataPie
};
