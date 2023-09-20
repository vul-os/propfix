import React, { useState, useEffect } from 'react';
import { Typography, Container, Grid, IconButton, Box, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import WidgetChart from "./widgets/widget-react-chart-js";
import WidgetSummary from "./widgets/widget-summary";

import { ChartOptionsBar as OptionsBarA } from "./charts/jobs-per-date-range";

const Dashboard = () => {

  const navigate = useNavigate();
  const theme = useTheme();

  const handleNavigate = (url) => {
    navigate(url);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: "20px" }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
            Dashboard
          </Typography>
        </Box>

      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <WidgetSummary
            name="jobs_created"
            templates={{}}
            title="Created Jobs"
            icon={'ant-design:code-sandbox-outlined'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <WidgetSummary
            name="jobs_open"
            templates={{}}
            title="Open Jobs"
            icon={'ant-design:code-sandbox-outlined'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <WidgetSummary
            name="jobs_closed"
            templates={{}}
            title="Closed Jobs"
            icon={'ant-design:code-sandbox-outlined'}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={8}>
          <WidgetChart navigate={handleNavigate} {...OptionsBarA} height={280} />
        </Grid>
      </Grid>


    </Container>
  );
}

export default Dashboard;
