import React from 'react';
import TextField from '@mui/material/TextField';

export default function JobInfoStep({ jobInfo, handleJobInfoChange }) {
  return (
    <div>
      <TextField
        label="Description"
        value={jobInfo.title}
        onChange={(e) => handleJobInfoChange({ ...jobInfo, title: e.target.value })}
        fullWidth
        style={{ marginBottom: '16px' }}
      />
      <TextField
        label="Priority"
        value={jobInfo.description}
        onChange={(e) => handleJobInfoChange({ ...jobInfo, description: e.target.value })}
        fullWidth
        style={{ marginBottom: '16px' }}
      />
      {/* Add other fields here */}
    </div>
  );
}
