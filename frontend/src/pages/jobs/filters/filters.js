import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField'; // Import TextField for form control
import FormControl from '@mui/material/FormControl';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel'; // Add this import
import Select from '@mui/material/Select'; // Add this import
import MenuItem from '@mui/material/MenuItem'; // Add this import
import Slider from '@mui/material/Slider'; // Import the Slider component from Material-UI


 

function Filter({sidebarOpen, toggleSidebar}) {
  const [searchText, setSearchText] = useState('');
  const [minCost, setMinCost] = useState(0);
  const [maxCost, setMaxCost] = useState(1000);
  console.log(sidebarOpen)

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
