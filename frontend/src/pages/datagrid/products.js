import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton } from '@mui/material';
import { ArrowUpward, ArrowDownward, Launch } from '@mui/icons-material';
import ExoDataGrid from './data-grid';
import config from '../../config/config';
import { useApiContext } from '../../contexts/api';

const ProductGrid = () => {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { postRequest } = useApiContext();
  const [selected, setSelected] = useState([]);

  const handleRowClick = (params) => {
    const productId = params.row.id;
    navigate(`/products/${productId}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const route = 'execute';
        const requestBody = {
          name: "products_page",
          template_dict: {},
        };
        const response = await postRequest(config.apiUrl, route, requestBody);
        if (response.data) {
          const data = response.data;
          const formattedData = data.ProductName.map((_, i) => {
            const {
              ProductIdentifier,
              ProductName,
              Rank,
              PercentageChange,
              SalesValue,
              MaxQty,
              Price,
              ProductUrl,
              ImageUrls,
              Revenue,
              RankChange,
              NegativeDifference
            } = data;

            let imageUrl = '';
            if (ImageUrls && ImageUrls.length > i && ImageUrls[i]) {
              const splitArray = ImageUrls[i].replace(/["[\]]/g, '').split(',');
              if (splitArray.length > 0) {
                imageUrl = splitArray[0];
              }
            }
            return {
              id: ProductIdentifier[i],
              name: ProductName[i] ? ProductName[i] : '',
              imageUrl,
              rank: Rank[i] ? Rank[i] : '',
              rankChange: RankChange[i] ? RankChange[i] : '',
              percentageChange: PercentageChange[i] ? PercentageChange[i] : '',
              price: Price[i] ? Price[i] : '',
              salesValue: SalesValue[i] ? SalesValue[i] : '',
              maxQty: MaxQty[i] ? MaxQty[i] : '',
              url: ProductUrl[i] ? ProductUrl[i] : '',
              revenue: Revenue[i] ? Revenue[i] : '',
              diff: NegativeDifference[i] ? NegativeDifference[i] : '',
            };
          });
          setProductList(formattedData);
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
  }, []);

  const productColumns = [
    {
      field: 'rank',
      headerName: 'Rank',
      align: 'center',
      width: 75,
      renderCell: (params) => {
        const rankValue = params.value;
        const rankChange = params.row.rankChange;
        const isPositiveChange = rankChange > 0;
        const changeIcon = isPositiveChange ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />;
        const formattedRankChange = `${Math.abs(rankChange)}`;

        return (
          <Box display="flex" alignItems="center">
            <Box fontWeight="bold" mr={1}>
              {rankValue}
            </Box>
            <Box color={isPositiveChange ? 'green' : 'red'} display="flex" alignItems="center">
              {changeIcon}
              {formattedRankChange}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'imageUrl',
      headerName: 'Image',
      align: 'center',
      sortable: false,
      width: 100,
      renderCell: (params) => (
        <img
          src={params.value}
          alt={params.row.name}
          style={{ borderRadius: '50%', width: '50px', height: '50px' }}
        />
      ),
    },
    { field: 'name', headerName: 'Name', align: 'left', width: 200 },
    { field: 'diff', headerName: 'Qty Sold', align: 'center', width: 100 },
    {
      field: 'price',
      headerName: `Price (R)`,
      align: 'left',
      valueFormatter: (params) => `R ${Number(params.value).toFixed(2)}`,
      width: 85,
    },
    { field: 'maxQty', headerName: 'Max Qty', align: 'left', width: 85 },
    {
      field: 'revenue',
      headerName: 'Revenue',
      align: 'left',
      width: 200,
      renderCell: (params) => {
        const revenueValue = Number(params.value).toFixed(2);
        const percentageChange = params.row.percentageChange;
        const isPositiveChange = percentageChange > 0;
        const changeIcon = isPositiveChange ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />;
        const formattedPercentageChange = `${Math.abs(percentageChange)}%`;

        return (
          <Box display="flex" alignItems="center">
            <Box fontWeight="bold" mr={1}>
              R {revenueValue}
            </Box>
            <Box color={isPositiveChange ? 'green' : 'red'} display="flex" alignItems="center">
              {changeIcon}
              {formattedPercentageChange}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'salesValue',
      headerName: `Sales Value (R)`,
      align: 'left',
      valueFormatter: (params) => `R ${Number(params.value).toFixed(2)}`,
      width: 150,
    },
    {
      field: 'url',
      headerName: 'URL',
      align: 'left',
      width: 80,
      renderCell: (params) => (
        <IconButton
          href={params.value}
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
    <ExoDataGrid 
      dataList={productList} 
      tableHead={productColumns} 
      isLoading={loading}
      onRowClick={handleRowClick}
      selected={selected}
      setSelected={setSelected}
    />
  );
};

export default ProductGrid;
