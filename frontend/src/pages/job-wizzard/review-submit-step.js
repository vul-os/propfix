import React from 'react';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import BuildingCard from './buildings/building-card';

const StyledLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: 100,
  flexShrink: 0,
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

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

function JobIssue({ issue }) {
  return (
    <div>
      <StyledLabel>Issue</StyledLabel>
      <TextField
        fullWidth
        multiline
        size="small"
        InputProps={{
          readOnly: true,
        }}
        value={issue}
      />
    </div>
  );
}

function JobAttachments({ attachments }) {
  return (
    <div>
      <StyledLabel>Attachments</StyledLabel>
      <div style={{ display: 'flex' }}>
        {attachments.map((file, index) => (
          <div key={index} style={{ marginRight: '10px' }}>
            <img
              src={URL.createObjectURL(file)}
              alt={`Uploaded File ${index}`}
              style={{
                width: 64,
                height: 64,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}


export default function ReviewSubmitStep({ building, job, files }) {
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
          {job.unitIdentifier}
        </Typography>
      </div>
      <div
        style={{
          margin: '10px',
          minWidth: '200px',
          cursor: 'default',
          borderRadius: '8px',
          padding: '10px',
          backgroundColor: 'rgb(255, 255, 255)',
          border: '1px solid rgb(204, 204, 204)',
        }}
      >
        <JobIssue issue={job.name} />
        <JobAttachments attachments={files || []} />
      </div>
    </Stack>
  );
}
