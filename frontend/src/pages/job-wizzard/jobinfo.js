import React from 'react';
import TextField from '@mui/material/TextField';

const JobInfoStep = ({ jobInfo, handleJobInfoChange }) => {
  return (
    <div>
      <TextField
        label="Job Title"
        value={jobInfo.title}
        onChange={handleJobInfoChange('title')}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Job Description"
        value={jobInfo.description}
        onChange={handleJobInfoChange('description')}
        fullWidth
        margin="normal"
        multiline
        rows={4}
      />
      {/* Add more input fields for job info as needed */}
    </div>
  );
};

export default JobInfoStep;
