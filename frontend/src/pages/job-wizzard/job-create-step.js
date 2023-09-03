import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import CloseIcon from '@mui/icons-material/Close';
import Stack from '@mui/material/Stack';
import { UploadBox } from '../../components/upload';
import LabelAutocomplete from '../labels/label-autocomplete';

export default function JobCreateStep({
  job,
  setJob,
  labels,
  selectedLabels,
  setSelectedLabels,
  handleDelete,
  handleDrop,
  files,
  setFiles
}) {
 
  return (
    <div>
      <TextField
        label="unitIdentifier"
        placeholder="Unit Number, 'E601'"
        value={job.unitIdentifier}
        onChange={(e) => setJob({ ...job, unitIdentifier: e.target.value })}
        fullWidth
        style={{ marginBottom: '16px' }}
      />
      <TextField
        label="Name"
        placeholder="Job Name, 'Gyser Issue'"
        value={job.name}
        onChange={(e) => setJob({ ...job, name: e.target.value })}
        fullWidth
        style={{ marginBottom: '16px' }}
      />

      <TextareaAutosize
        minRows={4}
        maxRows={10}
        label="description"
        placeholder="Description, 'I have had no hot water, cold water is working fine'"
        value={job.description}
        onChange={(e) => setJob({ ...job, description: e.target.value })}
        style={{
          width: '100%',
          marginBottom: '16px',
          padding: '8px',
          resize: 'vertical',
        }}
      />

      <LabelAutocomplete
        labels={labels}
        selectedLabels={selectedLabels}
        setSelectedLabels={setSelectedLabels}
      />

      <Stack direction="row" flexWrap="wrap">
         {files && files.map((file, index) => (
          <div
            key={index}
            style={{
              position: 'relative',
              marginRight: '10px',
              marginBottom: '10px',
            }}
          >
            <img
              src={URL.createObjectURL(file)}
              alt={`Uploaded File ${index}`}
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
                onClick={() => handleDelete(file)}
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

        <UploadBox onDrop={handleDrop} files={files} setFiles={setFiles} />
      </Stack>
    </div>
  );
}
