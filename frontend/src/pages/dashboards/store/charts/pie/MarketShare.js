const DATA_INDEX = "total_revenue";
const LABELS_INDEX = "SiteUrl";
const PRODUCT_IDENTIFIER_INDEX = "ProductIdentifier";

function generateColorRange(theme, length) {
  const primaryColor = theme.palette.primary.main; // Change to the desired primary color from the theme

  const colorRange = [];
  const hueStep = 120 / length; // Divide the hue range (120) evenly among the colors
  let currentHue = 120; // Start with a hue value of 120 (green)

  for (let i = 0; i < length; i+=1) {
    const color = `hsl(${currentHue}, 70%, 50%)`;
    colorRange.push(color);

    currentHue = (currentHue + hueStep) % 360; // Increment the hue value
  }

  return colorRange;
}

export function generateChartConfigPie(responseData, displayName, theme, navigate) {
  const productIdentifiers = responseData[PRODUCT_IDENTIFIER_INDEX];
  const dataLength = responseData[DATA_INDEX].length;

  const data = {
    datasets: [
      {
        data: responseData[DATA_INDEX],
        backgroundColor: generateColorRange(theme, dataLength),
      },
    ],
    labels: responseData[LABELS_INDEX],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const datasetLabel = context.dataset.label || '';
            const label = context.label;
            const value = context.formattedValue;
            return `${datasetLabel}: ${label} - ${value}`;
          },
        },
      },
    },
  };

  const onEvent = (index) => {
    console.log(productIdentifiers[index]);
  };

  const eventType = 'onClick';

  return { data, options, onEvent, eventType };
}

export const ChartOptionsPie = {
  title: "Market Share",
  subheader: "(+43%) than last year",
  name: "percentage_revenue_per_site",
  displayName: 'Sales',
  templates: {
    date_start: '2023-01-01',
    date_end: '2023-06-11',
  },
  type: 'pie',
  generateChartConfig: generateChartConfigPie,
};
