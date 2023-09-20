import moment from "moment";

const DATA_CLOSED_INDEX = "jobs_closed";
const DATA_OPENED_INDEX = "num_jobs";
const LABELS_INDEX = "job_date";

export function generateChartConfigBar(responseData, displayName, theme, navigate) {
    const rawLabels = responseData[LABELS_INDEX];

    // Format the dates using moment
    const labels = rawLabels.map(dateStr => moment(dateStr).format('YYYY-MM-DD'));

    const datasets = [
    {
        label: `${displayName} Created`,
        data: responseData[DATA_OPENED_INDEX],
        backgroundColor: theme.palette.primary.main,  // adjust the color as per your theme
    },
    {
        label: `${displayName} Closed`,
        data: responseData[DATA_CLOSED_INDEX],
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
      y: {
        ticks: {
          callback: (value) => `${value.toFixed(0)}`,
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
  title: "Created & Closed Jobs",
  subheader: "Number of Jobs created & closed for a date range",
  name: "jobs_created_closed",
  displayName: 'Jobs',
  templates: {
  },
  type: 'bar',
  generateChartConfig: generateChartConfigBar,
};
