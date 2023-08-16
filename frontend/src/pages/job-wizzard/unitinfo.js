import React from 'react';
import TextField from '@mui/material/TextField';

export default function UnitInfoStep({ unitInfo, handleUnitInfoChange }) {
  return (
    <div>
      <TextField
        label="Name"
        value={unitInfo.unitName}
        onChange={(e) => handleUnitInfoChange({ ...unitInfo, unitName: e.target.value })}
        fullWidth
        style={{ marginBottom: '16px' }}
      />
      <TextField
        label="Tenant Identifier"
        value={unitInfo.tenantIdentifier}
        onChange={(e) => handleUnitInfoChange({ ...unitInfo, tenantIdentifier: e.target.value })}
        fullWidth
        style={{ marginBottom: '16px' }}
      />
      <TextField
        label="Unit Identifier"
        value={unitInfo.unitIdentifier}
        onChange={(e) => handleUnitInfoChange({ ...unitInfo, unitIdentifier: e.target.value })}
        fullWidth
        style={{ marginBottom: '16px' }}
      />
      <TextField
        label="Building ID"
        value={unitInfo.buildingId}
        onChange={(e) => handleUnitInfoChange({ ...unitInfo, buildingId: e.target.value })}
        fullWidth
        style={{ marginBottom: '16px' }}
      />
      {/* Add other fields here */}
    </div>
  );
}
