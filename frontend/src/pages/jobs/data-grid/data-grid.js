import React, { useState, useEffect } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList'; // Import the Material-UI filter icon
import moment from 'moment';
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
import Button from '@mui/material/Button'; // Import the Button component from Material-UI
import { Icon } from '@iconify/react';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField'; // Import TextField for form control
import FormControl from '@mui/material/FormControl';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateField } from '@mui/x-date-pickers/DateField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel'; // Add this import
import Select from '@mui/material/Select'; // Add this import
import MenuItem from '@mui/material/MenuItem'; // Add this import
import Slider from '@mui/material/Slider'; // Import the Slider component from Material-UI

import Iconify from '../../../components/iconify';
import PopOver from '../pop-over';
import { useBoardContext } from '../../../contexts/board'; // Import the BoardProvider context
import CreateJobDialog from '../../job-wizzard/dialog';
import { exportToCSV, exportToExcel } from './utils';



const StyledDataGrid = styled(DataGrid)(() => ({
  '& .super-app-theme--Open': {
    backgroundColor: "rgba(255, 0, 0, 0.2)", // slight red
    '&:hover': {
      backgroundColor: "rgba(255, 0, 0, 0.3)", // slight red
    }
  },
  '& .super-app-theme--Closed': {
    backgroundColor: "", // slight red
  },
}));

function JobDataGrid() {
  const { board, jobs, boardLoading } = useBoardContext(); // Use the BoardProvider context
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [filterOpen, setFilterOpen] = useState(false); // Add filter state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [minCost, setMinCost] = useState(0); // Define minCost state
  const [maxCost, setMaxCost] = useState(1000); // Define maxCost state

  const [searchText, setSearchText] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter((job) =>
        job.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredJobs(filtered);
    }
  }, [jobs, searchText]);



const toggleSidebar = () => {
  setSidebarOpen(!sidebarOpen);
};

  
   const onClose = () => {
    setOpen(false);
  }

  const highlightRowStyle = {
    backgroundColor: "rgba(255, 0, 0, 0.01)", // slight red
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
    { field: 'createdAt', headerName: 'Created At', width: 160, renderCell: renderDate },
    {
      field: 'unitIdentifier',
      headerName: 'Unit Number',
      width: 200,
      valueGetter: (params) => params.row.unitIdentifier?.toUpperCase(), // Convert cell content to uppercase
      renderCell: (params) => (
        <strong>{params.value}</strong> // Wrap cell content in a <strong> element for bold text
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

     // Add the Hour column after the Assignees column
     {
      field: 'hours',
      headerName: 'Hours',
      width: 100,
      align: '-4px',
      headerAlign: '-5px',
    },

    { field: 'cost', headerName: 'Cost', type: 'number', width: 70 , headerAlign: '-5px', align:'-4px', },
    { field: 'closedAt', headerName: 'Closed At', width: 160, renderCell: renderDate },

  ];

  const handleRowClick = (params) => {
    setSelectedRow(params.row);
  };

    // Function to handle filter button click
    const handleFilterClick = () => {
      toggleSidebar();
    };
    

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
              borderRadius: '50%', // Use 50% to make it round
              minWidth: 0, // To prevent automatic width expansion
              width: '40px', // Set a fixed width (adjust as needed)
              height: '40px', // Set a fixed height (adjust as needed)
              WebkitBorderRadius: '30px',
              display: 'flex',
              alignItems: 'center', // Align items vertically
  
            }}
            size="small"
            onClick={() => exportToCSV(jobs, 'jobs')}
          >
            <Icon
            icon="grommet-icons:document-csv"
            style={{ fontSize:'20px', marginRight: '1.5px',}} // Adjust the fontSize here
  />
          </Button>
          <Button
            variant="contained"
            sx={{ 
              backgroundColor: 'black;',
              color: 'white',
              borderRadius: '50%', // Use 50% to make it round
              minWidth: 0, // To prevent automatic width expansion
              width: '40px', // Set a fixed width (adjust as needed)
              height: '40px', // Set a fixed height (adjust as needed)
              WebkitBorderRadius: '30px',
              display: 'flex',
              alignItems: 'center', // Align items vertically
  
            }}
            size="small"
            onClick={() => exportToExcel(jobs, 'jobs')}
          >
          <Icon
            icon="file-icons:microsoft-excel"
            style={{ fontSize:'20px', marginRight: '1.5px', }} // Adjust the fontSize here
/>
          </Button>
        </Stack>
      </Typography>

      <Button
          variant="contained"
          sx={{ 
            backgroundColor: 'white',
            color: 'black',
            // borderRadius: '50%',
            minWidth: 0,
            width: '40px',
            height: '40px',
            marginRight: '160px',
            marginLeft: 'auto', // Push the button to the right by setting marginLeft to auto
            marginTop: '-80px', // Add a negative top margin to move the button up
            marginBottom: '40px',
            // WebkitBorderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              backgroundColor: 'white', // Change background color on hover
              color: 'black', // Change text color on hover
            },
          }}
          size="small"
          onClick={handleFilterClick} // Call the filter button click handler
        >
          <h3 style={{ margin: 0, fontSize: '17px', marginTop:'3px', marginRight: '10px'}}>Filters</h3> {/* Add this line for the "Filters" heading */}
          <FilterListIcon style={{ fontSize: '20px', marginTop: '3px', }} />
        </Button>

{/* Sidebar */}
<Drawer anchor="right" open={sidebarOpen} onClose={toggleSidebar}>
<div style={{ width: '300px', padding: '16px', maxHeight: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', overflowX: 'hidden', }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <h2 style={{ fontSize: '18px', margin: 0 }}>Filters</h2>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          onClick={() => {
            // Handle reset filter logic here
          }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginRight: '8px',
          }}
        >
          <Icon icon="carbon:reset" style={{ fontSize: '20px' }} />
        </button>
        <button
          onClick={toggleSidebar}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Icon icon="ph:x" style={{ fontSize: '20px' }} />
        </button>
      </div>
    </div>

    <TextField
  label="Search Jobs"
  variant="outlined"
  fullWidth
  value={searchText}
  onChange={(e) => setSearchText(e.target.value)}
  sx={{ marginTop: '30px', marginBottom: '15px', }} // Add this line to move the search bar 10px up
/>
   

    {/* Add the "Created At" heading */}
    <h3 style={{ fontSize: '15px', margin: '5px 0 10px 5px', fontWeight: '600' }}>Created At</h3>
    
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ marginRight: '20px', width: '100%' }}>
        <DatePicker label="Start Date" />
      </Box>
    </LocalizationProvider>
    
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ marginTop: '20px' }}>
        <DatePicker label="End Date" />
      </Box>
    </LocalizationProvider>
    
    {/* Unit number */}
    <h3 style={{ fontSize: '15px', margin: '30px 0 10px 5px', fontWeight: '600' }}>Unit Number</h3>
    
    {/* Dropdown menu */}
    <FormControl variant="outlined" fullWidth>
      <InputLabel id="unit-number-label">Select Unit Number</InputLabel>
      <Select
        labelId="unit-number-label"
        id="unit-number-select"
        label="Select Unit Number"
      >
        <MenuItem value={1}>Unit 101</MenuItem>
        <MenuItem value={2}>Unit 102</MenuItem>
        <MenuItem value={3}>Unit 103</MenuItem>
        {/* Add more units as needed */}
      </Select>
    </FormControl>

      {/* Dropdown */}
      <h3 style={{ fontSize: '15px', margin: '30px 0 10px 5px', fontWeight: '600' }}>Building</h3>
    
    {/* Dropdown menu */}
    <FormControl variant="outlined" fullWidth>
      <InputLabel id="unit-number-label">Select Building</InputLabel>
      <Select
        labelId="unit-number-label"
        id="unit-number-select"
        label="Select Unit Number"
      >
        <MenuItem value={1}>Unit 101</MenuItem>
        <MenuItem value={2}>Unit 102</MenuItem>
        <MenuItem value={3}>Unit 103</MenuItem>
        {/* Add more units as needed */}
      </Select>
    </FormControl>

    
          {/* Names */}
          <h3 style={{ fontSize: '15px', margin: '30px 0 10px 5px', fontWeight: '600' }}>Names</h3>
    
    {/* Names menu */}
    <FormControl variant="outlined" fullWidth>
      <InputLabel id="unit-number-label">Select Names</InputLabel>
      <Select
        labelId="unit-number-label"
        id="unit-number-select"
        label="Select Unit Number"
      >
        <MenuItem value={1}>Unit 101</MenuItem>
        <MenuItem value={2}>Unit 102</MenuItem>
        <MenuItem value={3}>Unit 103</MenuItem>
        {/* Add more units as needed */}
      </Select>
    </FormControl>

        {/* End Date */}
        <h3 style={{ fontSize: '15px', margin: '30px 0 10px 5px', fontWeight: '600' }}>Due Date</h3>
    
        <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ marginRight: '20px', width: '100%' }}>
        <DatePicker label="Start Date" />
      </Box>
    </LocalizationProvider>
    
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ marginTop: '20px', width: '100%' }}>
        <DatePicker label="End Date" />
      </Box>
    </LocalizationProvider>

      {/* Names */}
      <h3 style={{ fontSize: '15px', margin: '30px 0 10px 5px', fontWeight: '600' }}>Priority</h3>
    
    {/* Names menu */}
    <FormControl variant="outlined" fullWidth>
      <InputLabel id="unit-number-label">Select Priority</InputLabel>
      <Select
        labelId="unit-number-label"
        id="unit-number-select"
        label="Select Unit Number"
      >
        <MenuItem value={1}>Unit 101</MenuItem>
        <MenuItem value={2}>Unit 102</MenuItem>
        <MenuItem value={3}>Unit 103</MenuItem>
        {/* Add more units as needed */}
      </Select>
    </FormControl>

      {/* Names */}
      <h3 style={{ fontSize: '15px', margin: '30px 0 10px 5px', fontWeight: '600' }}>Assignees</h3>
    
    {/* Names menu */}
    <FormControl variant="outlined" fullWidth>
      <InputLabel id="unit-number-label">Select Assignees</InputLabel>
      <Select
        labelId="unit-number-label"
        id="unit-number-select"
        label="Select Unit Number"
      >
        <MenuItem value={1}>Unit 101</MenuItem>
        <MenuItem value={2}>Unit 102</MenuItem>
        <MenuItem value={3}>Unit 103</MenuItem>
        {/* Add more units as needed */}
      </Select>
    </FormControl>

      {/* Hours */}
      <h3 style={{ fontSize: '15px', margin: '30px 0 10px 5px', fontWeight: '600' }}>Hours</h3>
      <FormControl variant="outlined" fullWidth>
      <InputLabel id="unit-number-label">Select Hours</InputLabel>
      <Select
        labelId="unit-number-label"
        id="unit-number-select"
        label="Select Unit Number"
      >
        <MenuItem value={1}>Unit 101</MenuItem>
        <MenuItem value={2}>Unit 102</MenuItem>
        <MenuItem value={3}>Unit 103</MenuItem>
        {/* Add more units as needed */}
      </Select>
    </FormControl>

     {/* Hours */}
     <h3 style={{ fontSize: '15px', margin: '30px 0 10px 5px', fontWeight: '600' }}>Cost</h3>
         {/* Range slider for Cost */}
    <div style={{ padding: '0 5px' }}>
      <Slider
        value={[minCost, maxCost]} // Replace 'minCost' and 'maxCost' with your state values
        onChange={(event, newValue) => {
          // Handle slider value change here
          const [newMinCost, newMaxCost] = newValue;
          setMinCost(newMinCost); // Update your state with the new min cost
          setMaxCost(newMaxCost); // Update your state with the new max cost
        }}
        valueLabelDisplay="auto" // Show value labels
        valueLabelFormat={(value) => `$${value}`} // Format the value labels
        min={0} // Minimum value
        max={1000} // Maximum value
      />
    </div>
  </div>
</Drawer>




      {jobs && !boardLoading && (
        <StyledDataGrid
          rows={jobs}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          checkboxSelection
          onRowClick={handleRowClick}
          getRowHeight={() => 60} // Set the desired row height (in pixels)
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
      >
        <AddIcon />
      </Fab>
      <CreateJobDialog open={open} onClose={onClose} />
    </Container>
  );
}

export default JobDataGrid; 