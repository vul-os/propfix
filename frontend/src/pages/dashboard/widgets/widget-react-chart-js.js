import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,  // Import ArcElement for Pie and Doughnut charts
  DoughnutController, // Import DoughnutController for Doughnut charts
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, Radar, PolarArea, getElementAtEvent } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import PropTypes from 'prop-types';
import { Card, CardHeader, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuthContext } from '../../../contexts/auth'; 
import { executeQuery } from '../../../api/dashboard'; 

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  ArcElement, // Register ArcElement for Pie and Doughnut charts
  DoughnutController // Register DoughnutController for Doughnut charts
);

// Generic function to handle events
const generateEventHandler = (chartRef, eventType, callback) => {
  return (event) => {
    const elements = getElementAtEvent(chartRef.current, event);
    if (elements && elements.length > 0 && elements[0]) {
      callback(elements[0].index);
    }
  };
};

export default function WidgetChart({
  title,
  subheader,
  name,
  templates,
  generateChartConfig,
  navigate,
  type,
  ...other
}) {
  const [chart, setChart] = useState(null);
  const theme = useTheme();
  const chartRef = useRef()
  const { getIdToken, user, activeOrganization } = useAuthContext(); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getIdToken(); // Get the JWT token from the auth context
        const response = await executeQuery(name, templates, activeOrganization, token);

        if (response.data) {
          const { data, options, onEvent, eventType } = generateChartConfig(response.data, theme, navigate);
          const handleEvent = generateEventHandler(chartRef, eventType, onEvent);
          setChart({ [eventType]: handleEvent, ref: chartRef, data, options });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    if (activeOrganization) {
        fetchData();
    }
  }, [activeOrganization]); // Empty dependency array ensures the effect runs only once

  return (
    <div>
      {!chart || !chart.data || !chart.options ? (
        <p>Loading...</p>
      ) : (
        <Card {...other}>
          <CardHeader title={title} subheader={subheader} />
          <Box sx={{ margin: "16px", height: other.height, width: "calc(100% - 32px)" }}>
            <ChartRenderer type={type} chartOptions={chart} other={other} />
          </Box>
        </Card>
      )}
    </div>
  );
}

const ChartRenderer = ({ type, chartOptions, ...other }) => {
  switch (type) {
      case 'bar':
          return <Bar {...chartOptions} {...other} />;
      case 'line':
          return <Line {...chartOptions} {...other} />;
      case 'pie':
          return <Pie {...chartOptions} {...other} />;
      case 'doughnut':
          return <Doughnut {...chartOptions} {...other} />;
      case 'radar':
          return <Radar {...chartOptions} {...other} />;
      case 'polarArea':
          return <PolarArea {...chartOptions} {...other} />;
      default:
          return null;
  }
};
