import React, { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import { useParams } from 'react-router-dom';
import config from '../../../config/config';
import WidgetSummary from "../widgets/WidgetSummary";
import WidgetProductCard from "../widgets/widget-product-card";
import WidgetChart from "../widgets/widget-react-chart-js"; // Import WidgetChart component
import { ChartOptionsBar as OptionsBarA } from "./charts/bar/RevenueOverTimeProduct";
import { ChartOptionsBar as OptionsBarB } from "./charts/bar/DatapointsOverTime";
import DatapointsOvertimeDatagrid from './datagrid/DatapointsOvertime'

export default function ProductDashboard() {
  const { productId } = useParams();

  const url = config.apiUrl;
  const templates = {
    ProductIdentifier: productId,
    date_start: '2023-01-01',
    date_end: '2023-06-22',
  };
  OptionsBarA.templates = templates;
  OptionsBarB.templates = templates;

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <WidgetProductCard
            url={url}
            name={"product_details"}
            templateDict={templates}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={8}>
          <WidgetChart navigate={() => null} {...{ ...OptionsBarB, url }} height={330} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <WidgetSummary
            url={url}
            name="product_revenue"
            templates={templates}
            title="Revenue"
            icon="icon-park-solid:sales-report"
            color="secondary"
            currency="R"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <WidgetSummary
            url={url}
            name="product_units_sold"
            templates={templates}
            title="Units Sold"
            icon="mdi:cash"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <WidgetSummary
            url={url}
            name="product_value"
            templates={templates}
            title="Value"
            icon="mdi:cart"
            color="info"
            currency="R"
          />
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <WidgetChart navigate={() => null} {...{ ...OptionsBarA, url }} height={364} />
        </Grid>
        <Grid item xs={12} md={12} lg={12}>
          <DatapointsOvertimeDatagrid templateDict={templates} />
        </Grid>
      </Grid>
    </>
  );
}
