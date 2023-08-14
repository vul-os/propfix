import React from 'react';
import TextField from '@mui/material/TextField';

const UnitInfoStep = ({ unitInfo, handleUnitInfoChange }) => {
  const handleUnitNameChange = (event) => {
    handleUnitInfoChange({ ...unitInfo, unitName: event.target.value });
  };

  // Add similar handlers for other unit info fields as needed

  return (
    <div>
      <TextField
        label="Unit Name"
        value={unitInfo.unitName}
        onChange={handleUnitNameChange}
        fullWidth
        margin="normal"
      />
      {/* Add more input fields for unit info as needed */}
    </div>
  );
};

export default UnitInfoStep;
