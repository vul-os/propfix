import React, { useState, useEffect } from 'react';
import { Typography, Container, Grid, IconButton, Box, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FilterIcon from '@mui/icons-material/FilterList';

import WidgetSummary from "../widgets/WidgetSummary";
import WidgetChart from "../widgets/widget-react-chart-js";

import config from '../../../config/config';
import { useApiContext } from '../../../contexts/api';

import FilterSidebar from './Sidebar';

import { ChartOptionsBar as OptionsBarA } from "./charts/bar/ProductDistributionAllSites";
import { ChartOptionsBar as OptionsBarB } from "./charts/bar/RevenueOverTimeAllSites";
import { ChartOptionsBar as OptionsBarC } from "./charts/bar/RevenuePerProductAllSites";
import { ChartOptionsPie as OptionsPieA } from "./charts/pie/MarketShare";

const AllStoresDashboard = ({ storeIds }) => {
  const url = config.apiUrl;
  const dateRange = {
    date_start: '2023-01-01',
    date_end: '2023-06-22'
  };

  const [stores, setStores] = useState([]);
  const [selectedDate, setSelectedDate] = useState([null, null]);
  const [openFilter, setOpenFilter] = useState(false);
  const { postRequest } = useApiContext();

  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const route = 'execute';
        const requestBody = {
          name: "site_unique",
          template_dict: {},
        };
        const response = await postRequest(url, route, requestBody);
        console.log(response);
        console.log(response.data, response.columns, response.data);
        if (response.columns && response.data) {
          const siteIdentifiers = response.data.SiteIdentifier;
          const urls = response.data.Url;
          const images = response.data.Image;
          console.log(siteIdentifiers, urls, images);

          const storeData = siteIdentifiers.map((siteIdentifier, index) => ({
            id: siteIdentifier,
            name: urls[index],
            image: images[index]
          }));
          setStores(storeData);
        } else {
          console.error('API fetch failed');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [url]);

  const handleNavigate = (url) => {
    navigate(url);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: "20px" }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>
            Hi, Welcome back
          </Typography>
        </Box>
        <IconButton onClick={() => setOpenFilter(true)}>
          <FilterIcon />
        </IconButton>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <WidgetSummary
            url={url}
            name="total_revenue"
            templates={dateRange}
            title="Weekly Sales"
            icon={'icon-park-solid:sales-report'}
            currency={"R"}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <WidgetSummary
            url={url}
            name="unique_products"
            templates={{}}
            title="Unique Products"
            icon={'ant-design:code-sandbox-outlined'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <WidgetSummary
            url={url}
            name="total_value"
            templates={{}}
            title="Total Value"
            color="secondary"
            icon={'ant-design:shop-filled'}
            currency={"R"}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={8}>
          <WidgetChart navigate={handleNavigate} {...{ ...OptionsBarA, url }} height={280} />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <WidgetChart navigate={handleNavigate} {...{ ...OptionsPieA, url }} height={280} />
        </Grid>
        <Grid item xs={12} md={6} lg={8}>
          <WidgetChart navigate={handleNavigate} {...{ ...OptionsBarB, url }} height={364} />
        </Grid>
        <Grid item xs={12} md={6} lg={8}>
          <WidgetChart navigate={handleNavigate} {...{ ...OptionsBarC, url }} height={280} />
        </Grid>
      </Grid>

      <FilterSidebar
        open={openFilter}
        setOpen={setOpenFilter}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        stores={stores}
        setStores={setStores}
      />
    </Container>
  );
}

export default AllStoresDashboard;
