import React, { useState, useEffect, useMemo } from 'react';
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
import TextField from '@mui/material/TextField'; // Import TextField for the search bar
import FormControl from '@mui/material/FormControl'; // Add this import
import InputLabel from '@mui/material/InputLabel'; // Add this import
import Select from '@mui/material/Select'; // Add this import
import MenuItem from '@mui/material/MenuItem'; // Add this import
import Iconify from '../../../components/iconify';
import PopOver from '../pop-over';
import { useBoardContext } from '../../../contexts/board';
import CreateJobDialog from '../../job-wizzard/dialog';
import { exportToCSV, exportToExcel } from './utils';
// import React, { useState, useEffect, useMemo } from 'react';
// import { DataGrid } from '@mui/x-data-grid';


function JobDataGrid() {
  const { board, jobs, boardLoading } = useBoardContext();
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [filterModel, setFilterModel] = useState({
    items: [],
  });
  const [searchText, setSearchText] = useState('');
  const [filterValue, setFilterValue] = useState('');

  const filterOptions = [
    { label: 'All', value: '' },
    { label: 'High Priority', value: 'high' },
    { label: 'Medium Priority', value: 'medium' },
    { label: 'Low Priority', value: 'low' },
  ];

  const onClose = () => {
    setOpen(false);
  }

  const avatarRenderer = (params) => {
    const members = board?.members;
    const assignees = Array.isArray(params.value) ? params.value : [params.value];
    return (
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
        {members && assignees.length > 0 && assignees.map((assigneeId) => (members[assigneeId]?.displayName &&
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
        {priority.toUpperCase()}
      </Stack>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const columns = [
    { field: 'id', headerName: <strong>ID</strong>, width: 150 },
    {
      field: 'unitIdentifier',
      headerName: <strong>UNIT NUMBER</strong>,
      width: 200,
      fontWeight: '600',
      valueGetter: (params) => params.row.unitIdentifier.toUpperCase(),
      renderCell: (params) => (
        <strong>{params.value}</strong>
      ),
    },
    {
      field: 'buildingId',
      headerName: <strong>BUILDING</strong>,
      width: 200,
      renderCell: renderBuilding,
    },
    { field: 'name', headerName: <strong>NAME</strong>, width: 200 },
    {
      field: 'labels',
      headerName: <strong>LABELS</strong>,
      width: 200,
      renderCell: renderLabel,
    },
    { field: 'dueDate', headerName: <strong>Due Date</strong>, width: 200, renderCell: renderDate },
    {
      field: 'priority',
      headerName: <strong>Priority</strong>,
      width: 150,
      renderCell: renderPriority,
    },
    { field: 'description', headerName: <strong>Description</strong>, width: 200 },
    {
      field: 'assigneeIds',
      headerName: <strong>Assignees</strong>,
      width: 150,
      renderCell: avatarRenderer,
    },
    {
      field: 'rentPaid',
      headerName: <strong>Rent Paid</strong>,
      width: 150,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center">
          {params.value ? 'Yes' : 'No'}
        </Stack>
      ),
    },
    {
      field: 'hours',
      headerName: <strong>Hours</strong>,
      width: 100,
      align: 'left',
      headerAlign: 'left',
    },
    {
      field: 'cost',
      headerName: <strong>Cost</strong>,
      type: 'number',
      width: 100,
      align: 'left',
      headerAlign: 'left',
    },
    { field: 'createdAt', headerName: <strong>Created At</strong>, width: 160, renderCell: renderDate, headerAlign: 'left', align: 'left' },
  ];

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
  };

  // Filter the jobs based on search text
  const handleFilterChange = (e) => {
    setFilterValue(e.target.value);
  };

  const filteredJobs = useMemo(() => {
    let filtered = jobs;
    if (searchText) {
      const searchTextLower = searchText.toLowerCase();
      filtered = jobs.filter(
        (job) =>
          job.name.toLowerCase().includes(searchTextLower) ||
          job.unitIdentifier.toLowerCase().includes(searchTextLower)
      );
    }
    return filtered;
  }, [jobs, searchText]);

  const filteredJobsWithFilter = useMemo(() => {
    let filtered = filteredJobs;
    if (filterValue) {
      filtered = filtered.filter((job) => job.priority.toLowerCase() === filterValue);
    }
    return filtered;
  }, [filteredJobs, filterValue]);

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
            onClick={() => exportToCSV(filteredJobsWithFilter, 'jobs')} // Use filteredJobsWithFilter here
          >
            <Icon
              icon="grommet-icons:document-csv"
              style={{ fontSize: '20px', marginRight: '1.5px' }}
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
            onClick={() => exportToExcel(filteredJobsWithFilter, 'jobs')} // Use filteredJobsWithFilter here
          >
            <Icon
              icon="file-icons:microsoft-excel"
              style={{ fontSize: '20px', marginRight: '1.5px' }}
            />
          </Button>
        </Stack>
      </Typography>

      {/* Search Bar */}
      <TextField
        label="Search Jobs"
        variant="outlined"
        fullWidth
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ width: '200px', marginBottom: '16px' }}
      />

      {/* Filter Dropdown */}
      <FormControl variant="outlined" sx={{ minWidth: 150, marginBottom: '16px', marginLeft: '10px' }}>
        <InputLabel htmlFor="filter-select">Filter Priority</InputLabel>
        <Select
          value={filterValue}
          onChange={handleFilterChange}
          label="Filter Priority"
          inputProps={{
            name: 'filter',
            id: 'filter-select',
          }}
        >
          {filterOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {filteredJobsWithFilter && !boardLoading && (
        <DataGrid
          rows={filteredJobsWithFilter}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          checkboxSelection
          onRowClick={handleRowClick}
          getRowHeight={() => 60}
          filterModel={filterModel}
          onFilterModelChange={handleFilterChange}
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
