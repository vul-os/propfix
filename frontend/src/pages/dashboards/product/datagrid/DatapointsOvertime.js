import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ArrowUpward, ArrowDownward, Launch } from '@mui/icons-material';
import ExoDataGrid from '../../../datagrid/data-grid';
import config from '../../../../config/config';
import { useApiContext } from '../../../../contexts/api';

const RevenueOverTimeDatagrid = ({ templateDict }) => {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const { postRequest } = useApiContext();
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const route = 'execute';
        const requestBody = {
          name: 'datapoints_overtime',
          template_dict: templateDict,
        };
        const response = await postRequest(config.apiUrl, route, requestBody);
        if (response.data) {
          const data = response.data;
          console.log(data);
          const formattedData = data.DateCreated.map((item, i) => ({
            id: i + 1,
            dateCreated: data.DateCreated[i] ? new Date(data.DateCreated[i]).toLocaleDateString() : '',
            maxQty: data.MaxQty[i] ? data.MaxQty[i] : '',
            price: data.Price[i] ? data.Price[i] : '',
          }));
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
      field: 'dateCreated',
      headerName: 'Date Created',
      align: 'left',
      width: 200,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString();
      },
    },
    {
      field: 'maxQty',
      headerName: 'Max Qty',
      align: 'left',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body1" fontWeight="bold" color={theme.palette.secondary.main}>
          {params.value || '0'}
        </Typography>
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      align: 'left',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body1" fontWeight="bold" color={theme.palette.primary.main}>
          {params.value || '0'}
        </Typography>
      ),
    },
  ];

  return (
    <ExoDataGrid
      dataList={productList}
      tableHead={productColumns}
      isLoading={loading}
      onRowClick={() => null}
      selected={selected}
      setSelected={setSelected}
    />
  );
};

export default RevenueOverTimeDatagrid;
