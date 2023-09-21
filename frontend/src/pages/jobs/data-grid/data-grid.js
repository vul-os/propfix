import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import moment from 'moment';
import IntroJs from 'intro.js';
import { styled } from '@mui/material/styles';
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
import Button from '@mui/material/Button'; 
import { Icon } from '@iconify/react';
import Iconify from '../../../components/iconify';
import PopOver from '../pop-over';
import { useBoardContext } from '../../../contexts/board';
import CreateJobDialog from '../../job-wizzard/dialog';
import { exportToCSV, exportToExcel } from './utils';
import 'intro.js/introjs.css';

const StyledDataGrid = styled(DataGrid)(() => ({
  '& .super-app-theme--Open': {
    backgroundColor: "rgba(255, 0, 0, 0.2)",
    '&:hover': {
      backgroundColor: "rgba(255, 0, 0, 0.3)",
    }
  },
  '& .super-app-theme--Closed': {
    backgroundColor: "",
  },
}));

function JobDataGrid() {
  const navigate = useNavigate()
  const { board, jobs, boardLoading } = useBoardContext(); // Use the BoardProvider context
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

   const onClose = () => {
    setOpen(false);
  }

  const highlightRowStyle = {
    backgroundColor: "rgba(255, 0, 0, 0.01)",
  };

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
      return null;
    }

    const labeledChips = params.value.map((labelId) => ({
      label: board?.labels[labelId] ? board.labels[labelId].name : "",
      length: board?.labels[labelId] ? board.labels[labelId].name.length : 0,
    }));

    labeledChips.sort((a, b) => a.length - b.length);

    return (
      <Stack direction="row">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
          {labeledChips.map((labeledChip, index) => (
            <Chip
              key={index}
              style={{
                backgroundColor: board?.labels[params.value[index]]
                  ? board.labels[params.value[index]].color
                  : "red",
                color: 'white',
                marginRight: '8px',
                marginBottom: index === labeledChips.length - 1 ? '4px' : '2px',
                marginTop: index === 0 ? '4px' : '0px',
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
        <HomeIcon sx={{ marginRight: 2 }} />
        <span>{building}</span>
        { building && 
          <HomeIcon sx={{ marginRight: 2 }} /> 
        }
        <span>{building}</span> 
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
        <strong>{priority.toUpperCase()}</strong>
      </Stack>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 150 },
    {
      field: 'unitIdentifier',
      headerName: 'Unit Number',
      width: 200,
      valueGetter: (params) => params.row.unitIdentifier?.toUpperCase(),
      renderCell: (params) => (
        <strong>{params.value}</strong>
      ),
    },
    {
      field: 'buildingId',
      headerName: 'Building',
      width: 200,
      renderCell: renderBuilding,
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
    {
      field: 'assigneeIds',
      headerName: 'Assignees',
      width: 150,
      renderCell: avatarRenderer,
    },

    {
      field: 'hours',
      headerName: 'Hours',
      width: 100,
      align: '-4px',
      headerAlign: '-5px',
    },

    { field: 'cost', headerName: 'Cost', type: 'number', width: 60 , headerAlign: '-5px', },
    { field: 'createdAt', headerName: 'Created At', width: 160, renderCell: renderDate },
    { field: 'closedAt', headerName: 'Closed At', width: 160, renderCell: renderDate },
  ];

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
  };

  useEffect(() => {
    const intro = IntroJs();

    const introCompleted = localStorage.getItem('introCompleted');
    if (!introCompleted) {
      intro.setOptions({
        steps: [
          {
            element: document.querySelector('.intro-step-fab'),
            intro: "Click this button to create a new job.",
          },
        ],
        showStepNumbers: true,
      });
      intro.start();

      localStorage.setItem('introCompleted', 'true');
    }

    return () => {
      intro.exit();
    };
  }, []);

  return (
    <Container maxWidth={false} sx={{ height: 1 }}>
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Jobs
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            sx={{ 
              backgroundColor: 'black;',
              color: 'white',
              borderRadius: '50%',
              minWidth: 0,
              width: '40px',
              height: '40px',
              WebkitBorderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
            }}
            size="small"
            onClick={() => exportToCSV(jobs, 'jobs')}
          >
            <Icon
              icon="grommet-icons:document-csv"
              style={{ fontSize:'20px', marginRight: '1.5px',}}
            />
          </Button>
          <Button
            variant="contained"
            sx={{ 
              backgroundColor: 'black;',
              color: 'white',
              borderRadius: '50%',
              minWidth: 0,
              width: '40px',
              height: '40px',
              WebkitBorderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
            }}
            size="small"
            onClick={() => exportToExcel(jobs, 'jobs')}
          >
            <Icon
              icon="file-icons:microsoft-excel"
              style={{ fontSize:'20px', marginRight: '1.5px', }}
            />
          </Button>
        </Stack>
      </Typography>

      {jobs && !boardLoading && (
        <StyledDataGrid
          rows={jobs}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          checkboxSelection
          onRowClick={handleRowClick}
          getRowHeight={() => 60}
          getRowClassName={(params) => {
            const date = params.row.closedAt;
            if (date && date !== "0001-01-01T00:00:00Z" && moment(date).isValid()) {
              return `super-app-theme--Open`;
            }
            return `super-app-theme--Closed`;
          }}
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
        className="intro-step-fab"
      >
        <AddIcon />
      </Fab>
      <CreateJobDialog open={open} onClose={onClose} />
    </Container>
  );
}

export default JobDataGrid;
