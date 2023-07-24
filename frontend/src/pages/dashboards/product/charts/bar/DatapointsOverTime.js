const LABELS_INDEX = "DateCreated";
const PRODUCT_IDENTIFIER_INDEX = "ProductIdentifier";

const DATA_INDEX_Y = "MaxQty"
const DATA_INDEX_Y1 = "Price"


export function generateChartConfigBar(responseData, displayName, theme, navigate) {
  const labels = responseData[LABELS_INDEX].map(dateStr => new Date(dateStr));
  const productIdentifiers = responseData[PRODUCT_IDENTIFIER_INDEX]

  const datasets = [
    {
      label: 'MaxQty',
      data: responseData[DATA_INDEX_Y],
      borderColor: '#00CC99',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      yAxisID: 'y',
    },
    {
      label: 'Price',
      data: responseData[DATA_INDEX_Y1],
      borderColor: '#00FF99',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      yAxisID: 'y1',
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
            enabled: true
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
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          callback: (value) => `R${value.toFixed(0)}`,
        },
        border: {
          dash: [2,4],
        },  
        grid: {
          color: 'rgba(0, 0, 0, 0.1)', 
        },
        min: 0,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
      },
      x: {
        type: 'time',
        ticks: {
          display: false,
        },
        grid: {
            display: false,
        },
      },
    },
    tooltips: {
        // Add this..
        intersect: false
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    },
  };
  const onEvent = (index) => {
    console.log(productIdentifiers[index])
  }
  const eventType = 'onDoubleClick'

  return { data, options, onEvent, eventType };
}

export const ChartOptionsBar = {
  title: "Datapoints Over Time",
  subheader: "(+43%) than last year",
  name: "datapoints_overtime",
  displayName: 'Datapoints Over Time',
  templates: {},
  type: 'line', 
  generateChartConfig: generateChartConfigBar,
};


