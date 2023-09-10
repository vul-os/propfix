import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Chip from '@mui/material/Chip';
import Iconify from '../../../components/iconify';
import PopOver from '../pop-over';
import { useBoardContext } from '../../../contexts/board'; // Import the BoardProvider context
import CreateJobDialog from '../../job-wizard/dialog';

function JobDataGrid() {
  const { jobs, boardLoading } = useBoardContext(); // Use the BoardProvider context
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const onClose = () => {
    setOpen(false);
  }

  const avatarRenderer = (params) => {
    const assignees = Array.isArray(params.value) ? params.value : [params.value];
    return (
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
        {assignees.map((assignee) => (
          <Tooltip key={assignee?.ID} title={assignee?.Name || ''}>
            <Avatar src={assignee?.AvatarURL} alt={assignee?.Name || ''} />
          </Tooltip>
        ))}
      </Stack>
    );
  };
  
  const renderLabel = (params) => (
    <Stack direction="row">
      <span style={{ height: 24, lineHeight: '24px', width: 100, flexShrink: 0, color: '#616161', fontWeight: 'bold' }}>
        Labels
      </span>
  
      {params && params.value && !!params.value.length && (
        <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
          {params.value.map((label) => (
            <Chip key={label} color="primary" label={label} size="small" variant="outlined" />
          ))}
        </Stack>
      )}
    </Stack>
  );
  
  const renderPriority = (params) => {
    let { value: priority } = params;
    priority = priority.toLowerCase();
  
    const getIcon = () => {
      if (priority === 'low') return 'solar:double-alt-arrow-down-bold-duotone';
      if (priority === 'medium') return 'solar:double-alt-arrow-right-bold-duotone';
      return 'solar:double-alt-arrow-up-bold-duotone';
    };
  
    const getIconColor = () => {
      if (priority === 'low') return 'info.main';
      if (priority === 'medium') return 'warning.main';
      return 'error.main';
    };
  
    return (
      <Stack direction="row" alignItems="center">
        <Iconify
          icon={getIcon()}
          sx={{
            mr: 0.5,
            color: getIconColor(),
          }}
        />
        {priority}
      </Stack>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 150 },
    { field: 'unitIdentifier', headerName: 'Unit Identifier', width: 200 },
    { field: 'buildingId', headerName: 'Building ID', width: 200 },
    { field: 'name', headerName: 'Name', width: 250 },
    {
      field: 'labels',
      headerName: 'Labels',
      width: 250,
      renderCell: renderLabel,
    },
    { field: 'dueDate', headerName: 'Due Date', width: 200, valueFormatter: (params) => formatDate(params.value) },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 150,
      renderCell: renderPriority,
    },
    { field: 'description', headerName: 'Description', width: 400 },
    {
      field: 'reporter',
      headerName: 'Reporter',
      width: 200,
      renderCell: avatarRenderer,
    },
    {
      field: 'assignees',
      headerName: 'Assignees',
      width: 250,
      renderCell: avatarRenderer,
    },
    { field: 'cost', headerName: 'Cost', type: 'number', width: 150 },
    { field: 'createdAt', headerName: 'Created At', width: 200, valueFormatter: (params) => formatDate(params.value) },
  ];

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
  };

  return (
    <Container maxWidth={false} sx={{ height: 1 }}>
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Jobs
      </Typography>

      {jobs && !boardLoading && (
        <DataGrid
          rows={jobs}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          checkboxSelection
          onRowClick={handleRowClick}
        />
      )}

      {selectedRow && (
        <PopOver
          job={selectedRow}
          openPopOver={selectedRow !== null}
          onClosePopOver={() => setSelectedRow(null)}
        />
      )}
      <Fab 
        color="primary" 
        aria-label="add" 
        style={{ position: 'fixed', bottom: '16px', right: '16px' }} 
        onClick={() => setOpen(true)} // Set dialog to open when FAB is clicked
      >
        <AddIcon />
      </Fab>
      <CreateJobDialog open={open} onClose={onClose} />
    </Container>
  );
}

export default JobDataGrid;
