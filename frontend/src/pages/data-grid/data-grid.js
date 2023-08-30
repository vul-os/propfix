import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip'; // Import Chip

// import { fetchAllJobs } from '../../api/jobs';
import { useAuthContext } from '../../contexts/auth';
import KanbanDetails from '../pop-over/kanban-details';
import KanbanDetailsPriority from '../pop-over/kanban-details-priority';
import Iconify from '../../components/iconify';

function JobDataGrid() {
  const [jobs, setJobs] = useState([]);
  const { getIdToken } = useAuthContext();
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    fetchJobsData();
  }, []);

  const fetchJobsData = async () => {
    try {
      const idToken = await getIdToken();
      // const allJobs = await fetchAllJobs(idToken);
      // setJobs(allJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };


  // Custom renderer for the reporter and assignees columns
  const avatarRenderer = (params) => {
    const assignees = Array.isArray(params.value) ? params.value : [params.value];
    return (
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
        {assignees.map((assignee) => (
          <Tooltip key={assignee.ID} title={assignee.Name}>
            <Avatar src={assignee.AvatarURL} alt={assignee.Name} />
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

      {!!params.value.length && (
        <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={1}>
          {params.value.map((label) => (
            <Chip key={label} color="primary" label={label} size="small" variant="outlined" /> // Using Chip with variant outlined and primary color
          ))}
        </Stack>
      )}
    </Stack>
  );

  const renderPriority = (params) => {
    let { value: priority } = params;
    priority = priority.toLowerCase()

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

  const columns = [
    { field: 'id', headerName: 'ID', width: 150 },
    { field: 'unitIdentifier', headerName: 'Unit Identifier', width: 200 },
    { field: 'buildingId', headerName: 'Building ID', width: 200 },
    { field: 'name', headerName: 'Name', width: 250 },
    {
        field: 'labels',
        headerName: 'Labels',
        width: 250,
        renderCell: renderLabel, // Use renderLabel function
    },
    { field: 'dueDate', headerName: 'Due Date', width: 200 },
    { field: 'priority', headerName: 'Priority', width: 150, renderCell: renderPriority }, // Use renderPriority function
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


    { field: 'attachmentUrls', headerName: 'Attachment URLs', width: 300 },
    { field: 'cost', headerName: 'Cost', type: 'number', width: 150 },
    { field: 'createdAt', headerName: 'Created At', width: 200 },
  ];

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
  };

  return (
    <Container maxWidth={false} sx={{ height: 1 }}>
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Jobs
      </Typography>

      <DataGrid
        rows={jobs}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        checkboxSelection
        onRowClick={handleRowClick}
      />
      {selectedRow && (
        <KanbanDetails
          task={selectedRow}
          openDetails={selectedRow !== null}
          onCloseDetails={() => setSelectedRow(null)}
        />
      )}
    </Container>
  );
}

export default JobDataGrid;
