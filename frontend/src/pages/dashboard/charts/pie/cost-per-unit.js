const DATA_INDEX = "total_cost";
const LABELS_INDEX = "unit_identifier";

const generateColorRange = (theme, length, saturation = 70, lightness = 50) => {
    if (!Number.isInteger(length) || length <= 0) {
        throw new Error("Invalid length provided.");
    }

    const hueStep = 20 / length;
    let currentHue = 0;  // You can adjust this fixed hue value if needed

    return Array.from({ length }).map(() => {
        const color = `hsl(${currentHue}, ${saturation}%, ${lightness}%)`;
        currentHue = (currentHue + hueStep) % 360;
        return color;
    });
}


export function generateChartConfigPie(responseData, theme, navigate) {
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
    // console.log(productIdentifiers[index]);
  };

  const eventType = 'onClick';

  return { data, options, onEvent, eventType };
}

export const ChartOptionsPie = {
  title: "Cost Per Unit",
  subheader: "Cost of total jobs per unit number, open or closed.",
  name: "total_cost_per_unit",
  templates: {

  },
  type: 'pie',
  generateChartConfig: generateChartConfigPie,
};
