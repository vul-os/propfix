import React from 'react';
import { TextField, IconButton, InputAdornment } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Buildings from './buildings/buildings'; // Import the Buildings component
import BuildingCard from './buildings/building-card'; // Import the BuildingCard component

export default function BuildingSelectorStep({
  selectedBuilding, // Use selectedBuilding directly
  setSelectedBuilding, // Use setSelectedBuilding directly
  buildings, // Change buildingInfoData to building
  searchValue,
  setSearchValue,
  handleLocationButtonClick,
  nextStep
}) {
  const handleSearchInputChange = (event) => {
    // Handle search input change here
    // You can access the new value using event.target.value
    const newValue = event.target.value;
    // You can use newValue to update the searchValue state
    setSearchValue(newValue);
  };

  const handleSelectBuilding = (building) => {
    // Use setSelectedBuilding to update the selected building
    setSelectedBuilding(building);
    nextStep()
  };

  return (
    <div>
      <TextField
        label="Search and Select a Building"
        fullWidth
        value={searchValue}
        onChange={handleSearchInputChange}
        onKeyDown={handleSearchInputChange}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleLocationButtonClick}>
                <LocationOnIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {/* Use the Buildings component to render the building cards */}
      <Buildings buildings={buildings} setSelectedBuilding={handleSelectBuilding} />
    </div>
  );
}
