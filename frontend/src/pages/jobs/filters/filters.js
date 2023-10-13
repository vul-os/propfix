import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

function Filter({ sidebarOpen, toggleSidebar, toFilter }) {
  const [searchText, setSearchText] = useState('');
  const [minCost, setMinCost] = useState(0);
  const [maxCost, setMaxCost] = useState(1000);
  const [buildingData, setBuildingData] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [selectedNames, setSelectedNames] = useState('');
  const [selectedHours, setSelectedHours] = useState([0, 24]); // Initial range for hours
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);


  // Prepare data for Autocomplete components
  const buildingOptions = toFilter.buildingId;
  const priorityOptions = toFilter.priority;
  const namesOptions = toFilter.name;
  const assigneesOptions = toFilter.assigneeIds;
  const hoursOptions = toFilter.hours;
  const [maxHours, setMaxHours] = useState(24); // Adjust the max value as needed
  
  console.log(toFilter);

  
  


  return (
    <Drawer anchor="right" open={sidebarOpen} onClose={toggleSidebar}>
      {/* Sidebar */}
    <Drawer anchor="right" open={sidebarOpen} onClose={toggleSidebar}>
    <div style={{ width: '300px', padding: '16px', maxHeight: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', overflowX: 'hidden', }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <h2 style={{ fontSize: '18px', margin: 0 }}>Filters</h2>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          onClick={() => {
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
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  sx={{ marginTop: '30px', marginBottom: '15px' }}
/>

   

  <h3 style={{ fontSize: '15px', margin: '5px 0 10px 5px', fontWeight: '600' }}>Created At</h3>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ marginRight: '20px', width: '100%' }}>
            <DatePicker label="Min/Max" />
          </Box>
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ marginTop: '20px', width: '100%' }}>
            <DatePicker label="Min/Max" />
          </Box>
        </LocalizationProvider>

        <h3 style={{ fontSize: '15px', margin: '30px 0 10px 5px', fontWeight: '600' }}>Unit Number</h3>
      <Autocomplete
          multiple
          options={buildingOptions} // Ensure this is a valid array of unit number options
          values={selectedBuilding}
          onChange={(event, newValue) => setSelectedBuilding(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Unit Number"
              variant="outlined"
              fullWidth
            />
          )}
          />


<h3 style={{ fontSize: '15px', margin: '30px 0 10px 5px', fontWeight: '600' }}>Building</h3>
<Autocomplete
          multiple
          options={buildingOptions}
          values={selectedBuilding}
          onChange={(e, newValue) => setSelectedBuilding(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Building"
              variant="outlined"
              fullWidth
            />
          )}
        />

  <h3 style={{ fontSize: '15px', margin: '30px 0 10px 5px', fontWeight: '600' }}>Names</h3>
<Autocomplete
  multiple
  options={namesOptions} // Ensure this is a valid array of name options
  values={selectedNames}
  onChange={(event, newValue) => setSelectedNames(newValue)}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Select Names"
      variant="outlined"
      fullWidth
    />
  )}
/>


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

  <h3 style={{ fontSize: '15px', margin: '30px 0 10px 5px', fontWeight: '600' }}>Priority</h3>
  <Autocomplete
          multiple
          options={priorityOptions}
          values={selectedPriority}
          onChange={(event, newValue) => setSelectedPriority(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Priority"
              variant="outlined"
              fullWidth
            />
          )}
        />


<h3 style={{ fontSize: '15px', margin: '30px 0 10px 5px', fontWeight: '600' }}>Hours</h3>
<div style={{ margin: '0 5px' }}>
  <Slider
    value={selectedHours}
    onChange={(event, newValue) => setSelectedHours(newValue)}
    valueLabelDisplay="auto"
    valueLabelFormat={(value) => `${value} hours`}
    min={0}
    max={24}
  />
</div>

  <h3 style={{ fontSize: '15px', margin: '30px 0 10px 5px', fontWeight: '600' }}>Cost</h3>
        <div style={{ padding: '0 5px' }}>
          <Slider
            value={[minCost, maxCost]}
            onChange={(event, newValue) => {
              const [newMinCost, newMaxCost] = newValue;
              setMinCost(newMinCost);
              setMaxCost(newMaxCost);
            }}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `$${value}`}
            min={0}
            max={1000}
          />


<button
    onClick={toggleSidebar} // Call toggleSidebar when the button is clicked
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
</Drawer>
    </Drawer>
  );
}

export default Filter;
