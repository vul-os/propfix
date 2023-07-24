import React, { useState, useEffect } from 'react';
import { Card, Typography, Paper, Container, CircularProgress } from '@mui/material';
import { DataGrid, GridOverlay } from '@mui/x-data-grid';
import DataGridToolbar from './data-grid-toolbar';

const ExoDataGrid = ({ dataList, tableHead, isLoading, onRowClick, selected, setSelected}) => {
  const [filterName, setFilterName] = useState('');
  const [filteredDataList, setFilteredDataList] = useState(dataList || []);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (dataList) {
      const filteredList = dataList.filter((data) =>
      filterName ? data.name.toLowerCase().includes(filterName.toLowerCase()) : false
      );

      setFilteredDataList(filterName ? filteredList : dataList);
      setIsNotFound(!filteredList.length && !!filterName);
    }
  }, [dataList, filterName]);

  const handleFilterName = (event) => {
    const value = event.target.value;
    setFilterName(value);
  };

  const ToolbarComponent = (
    <DataGridToolbar
      filterName={filterName}
      onFilterName={handleFilterName}
    />
  );

  return (
    <Container>
      <Card>
        {ToolbarComponent}
        {isLoading ? (
          <Container
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
            }}
          >
            <CircularProgress />
          </Container>
        ) : (
          <DataGrid
            initialState={{
              pagination: {
                paginationModel: { pageSize: 15, page: 0 },
              },
            }}
            onRowClick={onRowClick}
            rows={filteredDataList}
            columns={tableHead}
            autoHeight
            checkboxSelection
            disableSelectionOnClick
            onRowSelectionModelChange={(newRowSelectionModel) => {
              setSelected(newRowSelectionModel);
            }}
            rowSelectionModel={selected}
            components={{
              NoRowsOverlay: () => (
                <GridOverlay>
                  {isNotFound && (
                    <Paper sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" paragraph>
                        Not found
                      </Typography>
                      <Typography variant="body2">
                        No results found for&nbsp;
                        <strong>&quot;{filterName}&quot;</strong>.<br /> Try checking for typos or using complete words.
                      </Typography>
                    </Paper>
                  )}
                </GridOverlay>
              ),
            }}
          />
        )}
      </Card>
    </Container>
  );
};

export default ExoDataGrid;
