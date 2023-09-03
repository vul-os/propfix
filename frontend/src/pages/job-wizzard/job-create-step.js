import React from 'react';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import Stack from '@mui/material/Stack';
import { UploadBox } from '../../components/upload';

export default function JobCreateStep({
  job,
  setJob, // Changed handleJobInfoChange to setJob
  nextStep,
  handleDrop,
  handleRemoveFile,
  uploadedFiles,
}) {
  return (
    <div>
      <TextField
        label="Description"
        value={job.name}
        onChange={(e) => setJob({ ...job, name: e.target.value })}
        fullWidth
        style={{ marginBottom: '16px' }}
      />
      <TextField
        label="Labels"
        value={job.description}
        onChange={(e) => setJob({ ...job, description: e.target.value })}
        fullWidth
        style={{ marginBottom: '16px' }}
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
