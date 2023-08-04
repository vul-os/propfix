import React from 'react';
import TextField from '@mui/material/TextField';

const UnitInfoStep = ({ unitInfo, handleUnitInfoChange }) => {
  return (
    <div>
      <TextField
        label="Unit Name"
        value={unitInfo.unitName}
        onChange={handleUnitInfoChange('unitName')}
        fullWidth
        margin="normal"
      />
      {/* Add more input fields for unit info as needed */}
    </div>
  );
};

export default UnitInfoStep;
