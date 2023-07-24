import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import PlanCard from './plan';
import Pricing from './pricing';
import { useApiContext } from '../../contexts/api';
import config from '../../config/config';

const PlansPage = () => {
  const { postRequest } = useApiContext();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await postRequest(config.apiUrl, 'subscriptions', {});
        if (response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  const handlePlanClick = async (planCode) => {
    if (!planCode) {
        return
    }
    console.log("PlanCode: ", planCode)

    try {
      const response = await postRequest(config.apiUrl, 'subscription/create', {
        plan: planCode
      });
  
      if (response && response.authorization_url) {
        window.location.href = response.authorization_url;
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
  };

  const plans = [
    {
      title: 'Free',
      price: '0',
      description: ['Max 500 products'],
      buttonText: 'Default Plan',
      buttonVariant: 'outlined',
      planCode: null,
    },
    {
      title: 'Basic',
      subheader: 'Most popular',
      price: '99',
      description: ['Max 10,000 products'],
      buttonText: 'Get started',
      buttonVariant: 'contained',
      planCode: 'PLN_c2lqr775xgi0ffm',
    },
    {
      title: 'Pro',
      price: '449',
      description: ['Max 100,000 products'],
      buttonText: 'Get started',
      buttonVariant: 'contained',
      planCode: 'PLN_c2lqr775xgi0ffm',
    },
  ];

  const handleCancel = async (planCode) => {
    try {
      const response = await postRequest(config.apiUrl, 'subscription/disable', {
        code: planCode
      });
      // Check if cancellation was successful
      if (response.data && response.data.success) {
        console.log(`Cancelled plan with code: ${planCode}`);
        // Update the state with the updated data
        setData(null); // Reset the data to trigger re-render
        // You can update the UI or perform any additional actions after cancellation
      } else {
        console.error('Cancellation failed:', response.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Grid container spacing={4}>
        {data != null &&      
        <Grid item xs={12}>
            <Typography variant="h4" align="center" gutterBottom>
            Your Current Plan
            </Typography>
            {data != null && 
            <Box mb={4}>
                <PlanCard
                planCode={data[0].subscription_code}
                name={data[0].plan.name}
                price={`R${data[0].plan.amount / 100}`}
                onCancel={handleCancel}
                />
            </Box>
            }
            <Typography variant="subtitle1" align="center" gutterBottom>
            To upgrade your plan, please cancel your current plan first.
            </Typography>
        </Grid>
        }
      <Grid item xs={12}>
        <Box>
          <Typography variant="h5" align="center" gutterBottom>
            Pricing
          </Typography>
          <Pricing plans={plans} onPlanClick={handlePlanClick} />
        </Box>
      </Grid>
    </Grid>
  );
};

export default PlansPage;
