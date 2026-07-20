import { useTheme } from '@mui/material/styles';
import merge from 'lodash/merge';

export default function useChart(options) {
  const theme = useTheme();

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: theme.palette.text.secondary
        }
      },
      y: {
        grid: {
          drawBorder: false,
          color: theme.palette.divider
        },
        ticks: {
          color: theme.palette.text.secondary
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: theme.palette.text.primary
        }
      }
    }
  };

  return merge(baseOptions, options);
}
