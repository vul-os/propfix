import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
import { Card, CardHeader, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { useChart } from '../../../components/apexcharts';
import { useApiContext } from '../../../contexts/api';

WidgetChart.propTypes = {
  url: PropTypes.string.isRequired,
  title: PropTypes.string,
  subheader: PropTypes.string,
  name: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  WrapperComponent: PropTypes.elementType,
  generateChartConfig: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
};

export default function WidgetChart({ 
  title, subheader, 
  displayName, url, name, templates, 
  type,
  WrapperComponent,
  generateChartConfig,
  navigate,
  ...other 
}) {
  const [chart, setChart] = useState(null);
  const chartHook = useChart();
  const theme = useTheme();
  const { postRequest } = useApiContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const route = 'execute';
        const requestBody = {
          "template_dict": templates,
          "name": name,
        };
        console.log(requestBody)
        const response = await postRequest(url, route, requestBody);
        console.log(response)
        if (response.data) {
          const { data, options } = generateChartConfig(response.data, displayName, theme, navigate);

          // Merge the options using useChart
          const mergedOptions = { ...chartHook, ...options };
          console.log("hrtreee: ", mergedOptions)
          setChart({ data, options: mergedOptions });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures the effect runs only once

  return (
    <div>
      { !chart || !chart.data || !chart.options ? (
        <p>Loading...</p>
      ) : (
        <Card {...other}>
          <CardHeader title={title} subheader={subheader} />
          <WrapperComponent>
            <ReactApexChart type={type} series={chart.data} options={chart.options} {...other} />
          </WrapperComponent>
        </Card>
      )}
    </div>
  );
}

