import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles'; // Import styled
import TextField from '@mui/material/TextField'; // Import TextField component
import Typography from '@mui/material/Typography';
import BuildingCard from './buildings/building-card';
import InputName from '../../components/input-name';

const StyledLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: 100,
  flexShrink: 0,
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

// Define JobLabels component
function JobLabels({ labels }) {
  return (
    <div>
      <StyledLabel>Labels:</StyledLabel>
      {labels.map((label) => (
        <Typography variant="body2" key={label.id} style={{ fontSize: '0.8rem' }}>
          {label.name}
        </Typography>
      ))}
    </div>
  );
}

// Define JobName component
function JobName({ name, onChange }) {
  return (
    <div>
      <StyledLabel>Name</StyledLabel>
      <TextField
        fullWidth
        size="small"
        InputProps={{
          sx: { typography: 'body2' },
        }}
        value={name}
        onChange={onChange}
      />
    </div>
  );
}

// Define JobDescription component
function JobDescription({ description, onChange }) {
  return (
    <div>
      <StyledLabel>Description</StyledLabel>
      <TextField
        fullWidth
        multiline  // Make it multiline
        size="small"
        InputProps={{
          sx: { typography: 'body2' },
        }}
        value={description}
        onChange={onChange}
      />
    </div>
  );
}

// Define JobAttachments component
function JobAttachments({ attachments }) {
  return (
    <div>
      <StyledLabel>Attachments</StyledLabel>
      {/* Render attachments here */}
    </div>
  );
}

export default function ReviewSubmitStep({ building, job }) {
  const [editedJob, setEditedJob] = useState({ ...job });

  const handleNameChange = (e) => {
    setEditedJob({ ...editedJob, name: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    setEditedJob({ ...editedJob, description: e.target.value });
  };

  return (
    <Stack spacing={2}>
      {building ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <BuildingCard building={building} onSelectBuilding={() => {}} />
        </div>
      ) : (
        'No building information available'
      )}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Typography variant="body1" sx={{ fontSize: '25px', fontWeight: 'bold', color: '#333' }}>
          {editedJob.unitIdentifier}
        </Typography>
      </div>
      <div style={{ /* Container styling */ margin: '10px', minWidth: '200px', cursor: 'pointer', borderRadius: '8px', padding: '10px', backgroundColor: 'rgb(255, 255, 255)', border: '1px solid rgb(204, 204, 204)' }}>
        <JobName name={editedJob.name} onChange={handleNameChange} />
        <JobDescription description={editedJob.description} onChange={handleDescriptionChange} />
        <JobAttachments attachments={editedJob.attachmenturls || []} />
      </div>
    </Stack>
  );
}
