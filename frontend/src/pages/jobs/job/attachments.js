import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import { UploadBox } from '../../../components/upload';
import 'regenerator-runtime/runtime';


export default function Attachments({ files, handleDrop, handleRemoveFile}) {
  console.log("newfiles: ", files)

  return (
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
                onClick={() => handleRemoveFile(file)}
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

      <UploadBox onDrop={handleDrop} />
    </Stack>
  );
}

