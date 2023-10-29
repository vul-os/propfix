import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import Iconify from '../iconify';
import 'regenerator-runtime/runtime';

export default function Attachments({ files, handleRemoveFile }) {
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
              paddingTop: '10px',
              display: 'inline-block',
            }}
          >
            {/* {file.type === 'application/pdf' ? (
              <Iconify icon="prime:file-pdf" style={{ width: 64, height: 64 }}/>
            ) : (
           
            )} */}
              <img
              src={URL.createObjectURL(file)}
              alt={`Uploaded File ${index}`}
              style={{
                width: 64,
                height: 64,
              }}
            />
            { !!handleRemoveFile &&
            <div
              className="close-icon-background"
              style={{
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
                onClick={() => handleRemoveFile(file)}
                style={{
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '12px',
                  textTransform: 'none',
                }}
              /> 
            </div>}
          </div>
        </div>
      ))}

    </Stack>
  );
}

