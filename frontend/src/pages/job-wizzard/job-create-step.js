import React from 'react';
import TextField from '@mui/material/TextField';
import TextareaAutosize from '@mui/material/TextareaAutosize'; // Import TextareaAutosize
import CloseIcon from '@mui/icons-material/Close';
import Stack from '@mui/material/Stack';
import { UploadBox } from '../../components/upload';
import LabelAutocomplete from './labels/label-autocomplete'; // Import your LabelAutocomplete component

export default function JobCreateStep({
  job,
  setJob,
  labels,
  selectedLabels,
  setSelectedLabels,
  handleDrop,
  handleRemoveFile,
}) {
  return (
    <div>
      <TextField
        label="Name"
        placeholder="Name" // Use the same placeholder for all fields
        value={job.name}
        onChange={(e) => setJob({ ...job, name: e.target.value })}
        fullWidth
        style={{ marginBottom: '16px' }}
      />
     
      {/* Description */}
      <TextareaAutosize
        minRows={4} // Set the minimum number of rows
        maxRows={10} // Set the maximum number of rows (adjust as needed)
        placeholder="Description" // Use the same placeholder for the description field
        value={job.description} // Assuming your job object has a description field
        onChange={(e) => setJob({ ...job, description: e.target.value })}
        style={{
          width: '100%',
          marginBottom: '16px',
          padding: '8px',
          resize: 'vertical', // Allow vertical resizing
        }}
      />

      {/* Replaced the previous TextField for Labels with LabelAutocomplete */}
      <LabelAutocomplete
        labels={labels}
        selectedLabels={selectedLabels}
        setSelectedLabels={setSelectedLabels}
      />

      {/* Attachments */}
      <Stack direction="row" flexWrap="wrap">
        {job.attachments &&
          job.attachments.map((attachment, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                marginRight: '10px',
                marginBottom: '10px',
              }}
            >
              <img
                src={attachment}
                alt={`Attachment ${index}`}
                style={{ width: 64, height: 64 }}
              />
              <div
                className="close-icon-background"
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'rgba(33, 43, 54, 0.8)',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CloseIcon
                  className="close-icon"
                  onClick={() => handleRemoveFile(attachment)}
                  style={{
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: 14,
                    textTransform: 'none',
                  }}
                />
              </div>
            </div>
          ))}
        <UploadBox onDrop={handleDrop} />
      </Stack>
    </div>
  );
}
