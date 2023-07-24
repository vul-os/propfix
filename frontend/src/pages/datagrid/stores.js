import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Typography } from '@mui/material';
import { ArrowUpward, ArrowDownward, Launch } from '@mui/icons-material';
import { green, red } from '@mui/material/colors';
import ExoDataGrid from './data-grid';
import config from '../../config/config';
import { fCurrency } from '../../utils/formatNumber';
import StoresSummary from './stores-summary';
import { useApiContext } from '../../contexts/api';

const StoreGrid = () => {
  const [storeList, setStoreList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { postRequest } = useApiContext();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState([]);

  const result =
    storeList.length > 0
      ? storeList.reduce((sum, s) => {
          if (selected.length > 0 && selected.includes(s.siteIdentifier)) {
            return sum + (s.productCount ? s.productCount : 0);
          }
          return sum;
        }, 0)
      : 0;

  console.log("selected: ", selected)

  const updateStores = async () => {
    const route = 'site-permissions/update';
    const requestBody = {
      "site_identifiers": selected
    };
    const response = await postRequest(config.apiUrl, route, requestBody);
    
    // Handle the response as needed
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const route = 'execute';
        const requestBody = {
          name: 'stores_page',
          template_dict: {},
        };
        const response = await postRequest(config.apiUrl, route, requestBody);
        if (response.data) {
          const data = response.data;
          const formattedData = data.SiteIdentifier.map((_, i) => {
            const {
              SiteIdentifier,
              SiteName,
              SiteUrl,
              SiteImage,
              Period2Revenue,
              Period1Revenue,
              RevenueChange,
              Period1Rank,
              Period2Rank,
              ProductCount,
              TotalValue,
            } = data;

            return {
              id: SiteIdentifier[i],
              siteIdentifier: SiteIdentifier[i] ? SiteIdentifier[i] : '',
              name: SiteUrl[i] ? SiteUrl[i] : '',
              siteUrl: SiteUrl[i] ? SiteUrl[i] : '',
              siteImage: SiteImage[i] ? SiteImage[i] : '',
              period1Revenue: Period1Revenue[i] ? Period1Revenue[i] : '',
              period2Revenue: Period2Revenue[i] ? Period2Revenue[i] : '',
              revenueChange: RevenueChange[i] ? RevenueChange[i] : '',
              period1Rank: Period1Rank[i] ? Period1Rank[i] : '',
              period2Rank: Period2Rank[i] ? Period2Rank[i] : '',
              productCount: ProductCount[i] ? ProductCount[i] : '',
              totalValue: TotalValue[i] ? TotalValue[i] : '',
            };
          });
          setStoreList(formattedData);
        } else {
          console.error('API fetch failed');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [config.apiUrl]);

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
  }, [config.apiUrl]);
  
  const handleStoreClick = (storeIdentifier) => {
    navigate(`/stores/${storeIdentifier}`);
  };

  const storeColumns = [
    {
      field: 'period1Rank',
      headerName: 'Rank',
      align: 'center',
      width: 75,
      renderCell: (params) => {
        const rankValue = params.row.period1Rank;
        const rankChange = params.row.period1Rank - params.row.period2Rank;
        const isPositiveChange = rankChange > 0;
        const changeIcon = isPositiveChange ? (
          <ArrowUpward fontSize="small" />
        ) : (
          <ArrowDownward fontSize="small" />
        );
        const formattedRankChange = `${Math.abs(rankChange)}`;

        return (
          <Box display="flex" alignItems="center">
            <Box fontWeight="bold" mr={1}>
              {rankValue}
            </Box>
            <Box
              color={isPositiveChange ? green[500] : red[500]}
              display="flex"
              alignItems="center"
            >
              {changeIcon}
              {formattedRankChange}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'siteImage',
      headerName: 'Image',
      align: 'center',
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <img
          src={params.value}
          alt={params.row.siteName}
          style={{ borderRadius: '50%', width: '50px', height: '50px' }}
        />
      ),
    },
    {
      field: 'name',
      headerName: 'Name',
      align: 'left',
      width: 125,
      renderCell: (params) => (
        <Typography
          variant="body1"
          component="span"
          onClick={() => handleStoreClick(params.row.siteIdentifier)}
          style={{ cursor: 'pointer' }}
        >
          {params.value}
        </Typography>
      ),
    },
    { field: 'productCount', headerName: 'Num Products', align: 'left', width: 130 },
    {
      field: 'totalValue',
      headerName: 'Total Value',
      align: 'left',
      width: 200,
      renderCell: (params) => (
        <Box fontWeight="bold" display="flex" alignItems="left" justifyContent="left">
          <Typography variant="body1" component="span">
            R {fCurrency(params.value)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'period1Revenue',
      headerName: `Revenue`,
      align: 'left',
      width: 300,
      renderCell: (params) => {
        const revenueChange = params.row.period1Revenue - params.row.period2Revenue;
        const isIncrease = revenueChange >= 0;
        const Icon = isIncrease ? ArrowUpward : ArrowDownward;
        const color = isIncrease ? green[500] : red[500];
        return (
          <Box display="flex" alignItems="center" justifyContent="center">
            <Icon style={{ color }} />
            <Box fontWeight="bold" mr={1}>
              {`R ${fCurrency(params.value)}`}
            </Box>
            {revenueChange !== 0 && (
              <Typography
                component="span"
                variant="caption"
                style={{ marginLeft: 4, color }}
              >
                ({Math.abs(revenueChange).toFixed(0)}%)
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: 'siteUrl',
      headerName: 'URL',
      align: 'left',
      width: 100,
      renderCell: (params) => (
        <IconButton
          href={`https://${params.value}`}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
        >
          <Launch />
        </IconButton>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {data && 
        <StoresSummary updateStores={updateStores} maxProducts={data[0].max_products} numSelectedProducts={result} sx={{ ml: '25px' }} />
      }
      <ExoDataGrid dataList={storeList} tableHead={storeColumns} isLoading={loading} selected={selected} setSelected={setSelected} />
    </Box>
  );
};

export default StoreGrid;
