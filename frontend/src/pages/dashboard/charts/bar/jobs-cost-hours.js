import moment from "moment";

const DATA_COST_INDEX = "total_cost";
const DATA_HOURS_INDEX = "total_hours";
const LABELS_INDEX = "job_date";

export function generateChartConfigBar(responseData, theme, navigate) {
    const rawLabels = responseData[LABELS_INDEX];

    // Format the dates using moment
    const labels = rawLabels.map(dateStr => moment(dateStr).format('YYYY-MM-DD'));

    const datasets = [
        {
            label: `Job Cost`,
            data: responseData[DATA_COST_INDEX],
            yAxisID: 'y-axis-cost',
            backgroundColor: theme.palette.primary.main,
        },
        {
            label: `Job Hours`,
            data: responseData[DATA_HOURS_INDEX],
            yAxisID: 'y-axis-hours',
            backgroundColor: theme.palette.secondary.main,
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
        'y-axis-cost': {
            type: 'linear',
            position: 'left',
            ticks: {
                callback: (value) => `${value.toFixed(2)}` // or another format suitable for cost
            },
            border: {
                dash: [2, 4],
            },
            grid: {
                drawOnChartArea: false,
            },
        },
        'y-axis-hours': {
            type: 'linear',
            position: 'right',
            ticks: {
                callback: (value) => `${value.toFixed(0)}`
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
    // console.log(productIdentifiers[index]);
    // navigate(`/products/${productIdentifiers[index]}`);
  };
  const eventType = 'onDoubleClick';

  return { data, options, onEvent, eventType };
}

export const ChartOptionsBar = {
  title: "Job Cost & Hours",
  subheader: "The cost and number of hours worked for jobs over time for a date range",
  name: "jobs_cost_hours",
  templates: {
  },
  type: 'bar',
  generateChartConfig: generateChartConfigBar,
};
