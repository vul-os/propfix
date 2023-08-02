import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
// components
import { UploadBox } from '../../components/upload';
import 'regenerator-runtime/runtime';

// Import the `uploadFile` and `getFile` functions from `fileUploads.js`
import { uploadFile, getFile } from '../../api/attachments';

export default function KanbanDetailsAttachments({ jobId, attachments }) {
  const [files, setFiles] = useState(attachments || []); // Initialize with an empty array if attachments is not available

  const handleDrop = useCallback(
    async (acceptedFiles) => {
      try {
        // Upload the files using the `uploadFile` function from `fileUploads.js`
        const uploadPromises = acceptedFiles.map((file) => uploadFile(jobId, file)); // Replace "jobId" with your bucket name
        await Promise.all(uploadPromises);

        // After uploading, update the state with the new files
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
        // Remove the file using the `getFile` function from `fileUploads.js`
        await getFile(jobId, inputFile.name); // Replace "jobId" with your bucket name

        // After removing, update the state with the new files
        const filtered = files.filter((file) => file !== inputFile);
        setFiles(filtered);
      } catch (error) {
        console.error('Error removing file:', error);
      }
    },
    [jobId, files]
  );

  return (
    <Stack direction="row" flexWrap="wrap">
      {/* Display the uploaded images */}
      {files.map((file) => (
        <img
          key={file.name}
          className="MuiBox-root css-vvjom1"
          src={file.preview}
          alt={file.name}
          style={{ width: 64, height: 64 }}
        />
      ))}

      {/* The UploadBox component for uploading new files */}
      <UploadBox onDrop={handleDrop} />
    </Stack>
  );
}

KanbanDetailsAttachments.propTypes = {
  jobId: PropTypes.string.isRequired, // Make sure `jobId` is a required prop
  attachments: PropTypes.array,
};
