import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { fetchAllJobs } from '../../api/jobs';
import { useAuthContext } from '../../contexts/auth';
import KanbanDetails from '../pop-over/kanban-details';


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
      const allJobs = await fetchAllJobs(idToken);
      setJobs(allJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

// Custom renderer for the reporter and assignees columns
const avatarRenderer = (params) => {
    const assignees = Array.isArray(params.value) ? params.value : [params.value];
    return (
        <Container
            maxWidth={false}
            sx={{
            height: 1,
            }}
        >
            <Typography
            variant="h4"
            sx={{
                mb: { xs: 3, md: 5 },
            }}
            >
            Kanban
            </Typography>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                {assignees.map((assignee) => (
                <Tooltip key={assignee.ID} title={assignee.Name}>
                    <Avatar src={assignee.AvatarURL} alt={assignee.Name} />
                </Tooltip>
                ))}
            </Stack>
        </Container>
    );
  };
  
  

  const columns = [
    { field: 'id', headerName: 'ID', width: 150 },
    { field: 'name', headerName: 'Name', width: 250 },
    { field: 'dueDate', headerName: 'Due Date', width: 200 },
    { field: 'priority', headerName: 'Priority', width: 150 },
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
    { field: 'unitIdentifier', headerName: 'Unit Identifier', width: 200 },
    { field: 'buildingId', headerName: 'Building ID', width: 200 },
    { field: 'labels', headerName: 'Labels', width: 250 },
    { field: 'attachmentUrls', headerName: 'Attachment URLs', width: 300 },
    { field: 'cost', headerName: 'Cost', type: 'number', width: 150 },
    { field: 'createdAt', headerName: 'Created At', width: 200 },
  ];

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
  };

  return (
    <div style={{ height: 500, width: '100%' }}>
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
    </div>
  );
}

export default JobDataGrid;
