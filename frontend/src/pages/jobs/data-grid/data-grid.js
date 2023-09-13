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
import EventIcon from '@mui/icons-material/Event';
import HomeIcon from '@mui/icons-material/Home'; 
import Button from '@mui/material/Button'; // Import the Button component from Material-UI
import Iconify from '../../../components/iconify';
import PopOver from '../pop-over';
import { useBoardContext } from '../../../contexts/board'; // Import the BoardProvider context
import CreateJobDialog from '../../job-wizzard/dialog';
import { exportToCSV, exportToExcel } from './utils';
import { exportToCSV, exportToExcel } from './utils';




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
            <Avatar src={members[assigneeId]?.photoUrl} alt={members[assigneeId]?.displayName || ''} sx={{ margin: 0, padding: 0 }} />
          </Tooltip>
        ))}
      </Stack>
    );
  };
  
  
  const renderLabel = (params) => {
    if (!(params && params.value && params.value.length)) {
      return null; // Return null if there are no labels to render
    }
  
    // Calculate the label lengths and create an array of objects
    const labeledChips = params.value.map((labelId) => ({
      label: board?.labels[labelId] ? board.labels[labelId].name : "",
      length: board?.labels[labelId] ? board.labels[labelId].name.length : 0,
    }));
  
    // Sort the labeledChips array based on label length in ascending order
    labeledChips.sort((a, b) => a.length - b.length);
  
    return (
      <Stack direction="row">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          {labeledChips.map((labeledChip, index) => (
            <Chip
              key={index} // Use index as the key since labels may have the same length
              style={{
                backgroundColor: board?.labels[params.value[index]]
                  ? board.labels[params.value[index]].color
                  : "red",
                color: 'white', // Set text color to white
                marginRight: '8px', // Add margin between chips
                marginBottom: index === labeledChips.length - 1 ? '4px' : '2px', // Add margin at the bottom for the last chip in the row
                marginTop: index === 0 ? '4px' : '0px', // Add margin at the top for the first chip in the row
              }}
              label={labeledChip.label}
              size="small"
              variant="outlined"
            />
          ))}
        </div>
      </Stack>
    );
  };
  
  
  
  const renderDate = (params) => {
    const formattedDate = formatDate(params.value);
    return (
      <Stack direction="row" alignItems="center" sx={{ padding: '0px', color: 'black' }}>
        <EventIcon sx={{ marginRight: 2 }} />
        {formattedDate}
      </Stack>
    );
  };

  const renderBuilding = (params) => {
    const building = params.value && board?.buildings[params.value]?.buildingName;
    return (
      <Stack direction="row" alignItems="center">
        <HomeIcon sx={{ marginRight: 2 }} /> {/* Home icon with 1rem (10px) right margin */}
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
    { field: 'name', headerName: 'Name', width: 200 },
    {
      field: 'labels',
      headerName: 'Labels',
      width: 200,
      renderCell: renderLabel,
    },
    { field: 'dueDate', headerName: 'Due Date', width: 200,renderCell: renderDate},
    {
      field: 'priority',
      headerName: 'Priority',
      width: 150,

      renderCell: renderPriority,
    },
    { field: 'description', headerName: 'Description', width: 200 },
    // {
    //   field: 'reporter',
    //   headerName: 'Reporter',
    //   width: 200,
    //   renderCell: avatarRenderer,
    // },
    {
      field: 'assigneeIds',
      headerName: 'Assignees',
      width: 150,
      renderCell: avatarRenderer,
    },
    { field: 'cost', headerName: 'Cost', type: 'number', width: 60  },
    { field: 'createdAt', headerName: 'Created At', width: 150, renderCell: renderDate },
  ];

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
  };

  return (
    <Container maxWidth={false} sx={{ height: 1 }}>
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Jobs
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            sx={{ 
              backgroundColor: '#1976d2;',
              color: 'white',
              border: '1px solid black',
              WebkitBorderRadius: '10px',
              display: 'flex',
              alignItems: 'center', // Align items vertically
            }}
            size="small"
            onClick={() => exportToCSV(jobs, 'jobs')}
          >
            <Iconify icon="fa-file-csv" width={20} style={{ marginRight: '8px' }} />
            Export to CSV
          </Button>
          <Button
            variant="contained"
            sx={{ 
              backgroundColor: '#2e7d32;',
              color: 'white',
              border: '1px solid black',
              WebkitBorderRadius: '10px',
              display: 'flex',
              alignItems: 'center', // Align items vertically
            }}
            size="small"
            onClick={() => exportToExcel(jobs, 'jobs')}
          >
            <Iconify icon="fa-file-excel" width={20} style={{ marginRight: '8px' }} />
            Export to Excel
          </Button>
        </Stack>
      </Typography>

      {jobs && !boardLoading && (
        <DataGrid
        rows={jobs}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        checkboxSelection
        onRowClick={handleRowClick}
        getRowHeight={() => 60} // Set the desired row height (in pixels)
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
        style={{ position: 'fixed', bottom: '75px', right: '16px' }} 
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Fab>
      <CreateJobDialog open={open} onClose={onClose} />
    </Container>
  );
}

export default JobDataGrid;