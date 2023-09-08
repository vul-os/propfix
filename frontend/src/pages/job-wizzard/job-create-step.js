import React from 'react';
import TextField from '@mui/material/TextField';
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
        label="Unit Identifier"
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
      <TextField
        label="Description"
        placeholder="Description, 'I have had no hot water, cold water is working fine'"
        value={job.description}
        onChange={(e) => setJob({ ...job, description: e.target.value })}
        fullWidth
        style={{ marginBottom: '16px' }}
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
            }}
          >
            <div
              style={{
                position: 'relative',
                paddingTop: '10px', // Add paddingTop for spacing
                display: 'inline-block',
              }}
            >
              <img
                src={URL.createObjectURL(file)}
                alt={`Uploaded File ${index}`}
                style={{
                  width: 64,
                  height: 64,
                }}
              />
              <div
                className="close-icon-background"
                style={{
                  position: 'absolute',
                  top: '22%', // Move the icon down to the center of the image
                  transform: 'translateY(-50%)', // Center vertically
                  right: '0px', // Move the icon to the right
                  width: '16px', // Set a smaller width
                  height: '16px', // Set a smaller height
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
                    fontSize: '12px', // Adjust the font size
                    textTransform: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        <div style={{ marginBottom: '10px' }}>
          <div
            style={{
              paddingTop: '10px', // Add paddingTop for spacing
            }}
          >
            <UploadBox onDrop={handleDrop} files={files} setFiles={setFiles} />
          </div>
        </div>
      </Stack>
    </div>
  );
}
