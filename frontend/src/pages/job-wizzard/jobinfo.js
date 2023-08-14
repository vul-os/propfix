import React from 'react';
import TextField from '@mui/material/TextField';

const JobInfoStep = ({ jobInfo, handleJobInfoChange }) => {
  const handleTitleChange = (event) => {
    handleJobInfoChange({ ...jobInfo, title: event.target.value });
  };

  const handleDescriptionChange = (event) => {
    handleJobInfoChange({ ...jobInfo, description: event.target.value });
  };

  return (
    <div>
      <TextField
        label="Job Title"
        value={jobInfo.title}
        onChange={handleTitleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Job Description"
        value={jobInfo.description}
        onChange={handleDescriptionChange}
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
