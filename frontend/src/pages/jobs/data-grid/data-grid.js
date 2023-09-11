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
import Box from '@mui/material/Box';

import EventIcon from '@mui/icons-material/Event';
import HomeIcon from '@mui/icons-material/Home'; 
import Iconify from '../../../components/iconify';
import PopOver from '../pop-over';
import { useBoardContext } from '../../../contexts/board'; // Import the BoardProvider context
import CreateJobDialog from '../../job-wizzard/dialog';
// import { exportToCSV, exportToExcel } from './utils';


function JobDataGrid() {
  const { board, jobs, boardLoading } = useBoardContext(); // Use the BoardProvider context
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);


  const onClose = () => {
    setOpen(false);
  }

  const avatarRenderer = (params) => {
    const members = board?.members
    const assignees = Array.isArray(params.value) ? params.value : [params.value];
    return (
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
        {members && assignees.length > 0 && assignees.map((assigneeId) => ( members[assigneeId]?.displayName &&
          <Tooltip key={assigneeId} title={members[assigneeId]?.displayName || ''}>
            <Avatar src={members[assigneeId]?.photoUrl} alt={members[assigneeId]?.displayName || ''} />
          </Tooltip>
        ))}
      </Stack>
    );
  };
  
  const renderLabel = (params) => (
    <Stack direction="row"> 
      {params && params.value && !!params.value.length && (
        <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
          {params.value.map((labelId) => (
            <Chip key={labelId} style={{ backgroundColor: board?.labels[labelId] ? board.labels[labelId].color : "red"}} label={board?.labels[labelId] ? board.labels[labelId].name : ""} size="small" variant="outlined" />
          ))}
        </Stack>
      )}
    </Stack>
  );

  const renderDate = (params) => {
    const formattedDate = formatDate(params.value);
    return (
      <Stack direction="row" alignItems="center">
        <EventIcon sx={{ marginRight: 0.5 }} />
        {formattedDate}
      </Stack>
    );
  };

  const renderBuilding = (params) => {
    const building = params.value && board?.buildings[params.value]?.buildingName
    return (
      <Stack direction="row" alignItems="center">
        <HomeIcon /> {/* Home icon */}
        <span>{building}</span> {/* Building ID value */}

      </Stack>
    );
  };
  
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
    {
      field: 'buildingId',
      headerName: 'Building ID',
      width: 200,
      renderCell: renderBuilding, // Use the renderBuildingId function for rendering
    },
    { field: 'name', headerName: 'Name', width: 250 },
    {
      field: 'labels',
      headerName: 'Labels',
      width: 250,
      renderCell: renderLabel,
    },
    { field: 'dueDate', headerName: 'Due Date', width: 200, renderCell: renderDate},
    {
      field: 'priority',
      headerName: 'Priority',
      width: 150,
      renderCell: renderPriority,
    },
    { field: 'description', headerName: 'Description', width: 400 },
    // {
    //   field: 'reporter',
    //   headerName: 'Reporter',
    //   width: 200,
    //   renderCell: avatarRenderer,
    // },
    {
      field: 'assigneeIds',
      headerName: 'Assignees',
      width: 250,
      renderCell: avatarRenderer,
    },
    { field: 'cost', headerName: 'Cost', type: 'number', width: 150 },
    { field: 'createdAt', headerName: 'Created At', width: 200, renderCell: renderDate },
  ];

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
  };

  return (
    <Container maxWidth={false} sx={{ height: 1 }}>
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Jobs
        {/* <button onClick={() => exportToCSV(jobs, 'jobs')}>Export to CSV</button>
        <button onClick={() => exportToExcel(jobs, 'jobs')}>Export to Excel</button> */}
      </Typography>

      <Box sx={{}}>
        {jobs && !boardLoading && (
          <DataGrid
            rows={jobs}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            checkboxSelection
            onRowClick={handleRowClick}
            style={{ height: '100%' }} // Set height to 100%
          />
        )}
      </Box>

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
        style={{ position: 'fixed', top: '120px', right: '16px' }} 
        onClick={() => setOpen(true)} // Set dialog to open when FAB is clicked
      >
        <AddIcon />
      </Fab>
      <CreateJobDialog open={open} onClose={onClose} />
    </Container>
  );
}

export default JobDataGrid;

