import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import { UploadBox } from '../../../components/upload';
import 'regenerator-runtime/runtime';
import { useAuthContext } from '../../../contexts/auth'; 

import { uploadFile, getFile, deleteFile } from '../../../api/attachments';

export default function Attachments({ jobId, attachments }) {
  const [files, setFiles] = useState(attachments || []);
  const { getIdToken } = useAuthContext(); 

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      try {
        const token = await getIdToken(); 

        const uploadPromises = acceptedFiles.map((file) => uploadFile(jobId, file, token));
        await Promise.all(uploadPromises);

        const newFiles = acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      } catch (error) {
        console.error('Error uploading files:', error);
      }
    },
    [jobId]
  );

  const handleRemoveFile = useCallback(
    async (inputFile) => {
      try {
        const token = await getIdToken(); 

        await deleteFile(jobId, inputFile.name, token);

        // Filter the files and update the state
        setFiles((prevFiles) => prevFiles.filter((file) => file !== inputFile));
      } catch (error) {
        console.error('Error removing file:', error);
      }
    },
    [jobId]
  );

  return (
    <Stack direction="row" flexWrap="wrap">
      {/* Display the uploaded images */}
      {files.map((file) => (
        <div key={file.name} style={{ position: 'relative', marginRight: '10px', marginBottom: '10px' }}>
          <img
            className="MuiBox-root css-vvjom1"
            src={file.preview}
            alt={file.name}
            style={{ width: 64, height: 64 }}
          />
          {/* Round background covering the X icon */}
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
              zIndex: 1, // Set the background above the image
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Close icon to remove the image */}
            <CloseIcon
              className="close-icon"
              onClick={() => handleRemoveFile(file)}
              style={{
                cursor: 'pointer',
                color: 'white', // Set the color to white
                fontSize: 14, // Set the font size smaller
                textTransform: 'none', // Reset text transformation
              }}
            />
          </div>
        </div>
      ))}

      <UploadBox onDrop={handleDrop} />
    </Stack>
  );
}

Attachments.propTypes = {
  jobId: PropTypes.string.isRequired,
  attachments: PropTypes.array,
};
