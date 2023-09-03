import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
//
import Iconify from '../iconify';

// ----------------------------------------------------------------------

export default function UploadBox({ placeholder, error, disabled, files, setFiles, sx, ...other }) {
  const onDrop = useCallback((acceptedFiles) => {
    // Update the files state with the selected files
    setFiles(acceptedFiles);
  }, [setFiles]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    disabled,
    onDrop,
    ...other,
  });

  const hasError = isDragReject || error;

  return (
    <Box
      {...getRootProps()}
      sx={{
        m: 0.5,
        width: 64,
        height: 64,
        flexShrink: 0,
        display: 'flex',
        borderRadius: 1,
        cursor: 'pointer',
        alignItems: 'center',
        color: 'text.disabled',
        justifyContent: 'center',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
        border: (theme) => `dashed 1px ${alpha(theme.palette.grey[500], 0.16)}`,
        ...(isDragActive && {
          opacity: 0.72,
        }),
        ...(disabled && {
          opacity: 0.48,
          pointerEvents: 'none',
        }),
        ...(hasError && {
          color: 'error.main',
          bgcolor: 'error.lighter',
          borderColor: 'error.light',
        }),
        '&:hover': {
          opacity: 0.72,
        },
        ...sx,
      }}
    >
      <input {...getInputProps()} />

      {placeholder || <Iconify icon="eva:cloud-upload-fill" width={28} />}
    </Box>
  );
}

UploadBox.propTypes = {
  disabled: PropTypes.object,
  error: PropTypes.bool,
  placeholder: PropTypes.object,
  sx: PropTypes.object,
  files: PropTypes.array.isRequired,
  setFiles: PropTypes.func.isRequired
};
