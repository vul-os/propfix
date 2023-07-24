import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// @mui
import { Box, Card, Link, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
// utils
import { fCurrency } from '../../../utils/formatNumber';
import Iconify from '../../../components/iconify';
import { useApiContext } from '../../../contexts/api';


// ----------------------------------------------------------------------

const StyledProductImg = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
});

const StyledCard = styled(Card)({
  background: 'linear-gradient(135deg, #ffffff 0%, #e1f5fe 100%)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  borderRadius: '12px',
  overflow: 'hidden',
});

// ----------------------------------------------------------------------

WidgetProductCard.propTypes = {
  url: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

export default function WidgetProductCard({ url, name, templateDict }) {
  const [data, setData] = useState(null);
  const { postRequest } = useApiContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const route = 'execute';
        const requestBody = {
          template_dict: templateDict,
          name,
        };
        const response = await postRequest(url, route, requestBody);

        if (response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, [url, name, templateDict]);

  if (!data) {
    return null; // or show a loading state
  }

  const { ProductName, Price, MaxQty, ImageURLs } = data;

  return (
    <StyledCard>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        <StyledProductImg alt={ProductName} src={ImageURLs[0].replace(/[[\]]/g, '')} />
      </Box>

      <Stack spacing={1.5} sx={{ p: 2 }}>
        <Link color="inherit" underline="hover">
          <Typography variant="subtitle2" noWrap>
            {ProductName}
          </Typography>
        </Link>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center">
            <Typography variant="subtitle1">
              {fCurrency(Price)}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center">
            <Iconify icon="bi:cart4" width={16} height={16} sx={{ mr: 0.5 }} />
            <Typography variant="subtitle1">
              {MaxQty}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </StyledCard>
  );
}
