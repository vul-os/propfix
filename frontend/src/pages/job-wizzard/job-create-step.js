import React, { useState } from 'react';
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
  const [popupImage, setPopupImage] = useState(null);
  const [popupIndex, setPopupIndex] = useState(null);

  // Function to open the image in a popup
  const openImagePopup = (image, index) => {
    setPopupImage(image);
    setPopupIndex(index);
  };

  // Function to close the image popup
  const closeImagePopup = () => {
    setPopupImage(null);
    setPopupIndex(null);
  };

  return (
    <div>
      <TextField
        label="Unit Identifier"
        placeholder="Enter the unit identifier, e.g., 'E601'"
        value={job.unitIdentifier}
        onChange={(e) => setJob({ ...job, unitIdentifier: e.target.value })}
        fullWidth
        style={{ marginBottom: '16px' }}
      />
      <TextField
        label="Issue"
        placeholder="Enter the issue or job description, e.g., 'Gyser Issue'."
        value={job.name}
        onChange={(e) => setJob({ ...job, name: e.target.value })}
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
                paddingTop: '10px',
                display: 'flex', // Display the image and icon side by side
                alignItems: 'center', // Vertically center the image and icon
                cursor: 'pointer',
              }}
              onClick={() => openImagePopup(URL.createObjectURL(file), index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  openImagePopup(URL.createObjectURL(file), index);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <input
                multiple=""
                type="file"
                style={{ display: 'none' }}
              />
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
                  marginLeft: '8px',
                  marginTop:'2px',
                  position: 'absolute',
                  top: '22%',
                  transform: 'translateY(-50%)',
                  right: '0px',
                  width: '16px',
                  height: '16px',
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
                    fontSize: '12px',
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
              paddingTop: '10px',
            }}
          >
            <UploadBox onDrop={handleDrop} files={files} setFiles={setFiles} />
          </div>
        </div>
      </Stack>

      {/* Image Popup */}
      {popupImage !== null && popupIndex !== null && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={closeImagePopup}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closeImagePopup();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <img
            src={popupImage}
            alt={`File ${popupIndex}`}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
            }}
          />
        </div>
      )}
    </div>
  );
}
