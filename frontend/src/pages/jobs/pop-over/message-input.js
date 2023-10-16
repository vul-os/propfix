import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import InputBase from '@mui/material/InputBase';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import Iconify from '../../../components/iconify';
import Attachments from '../../../components/attachments.';

export default function MessageInput({ user, handleDrop, createMessage, activeOrganization }) {
  const [isPublic, setIsPublic] = useState(activeOrganization === "");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);

  const handleSwitchChange = () => {
    if (activeOrganization !== "") setIsPublic(!isPublic);
  };

  const handleRemoveFile = (fileToRemove) => {
    setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  }

  const handleMessageSend = async () => {
      try {
        if (files?.length > 0) {
          try {
            const uploadedObjectNames = await handleDrop(files);
            console.log('Uploaded Object Names:', uploadedObjectNames);
            
            // Now you can use uploadedObjectNames for further processing if needed
            
            await createMessage(message, isPublic, uploadedObjectNames);
            setFiles([]);
            setMessage(""); // optionally, clear the message after sending
            // success actions
          } catch (error) {
            console.error("Failed to drop files:", error);
          }        
        } else {
          console.log("message", message);
          await createMessage(message, isPublic, null);
          setMessage(""); // optionally, clear the message after sending
        }

      } catch (error) {
        console.error("Failed to send message:", error);
      }
  };


  const handleFileChange = (event) => {
    const file = event.target.files[0]; // get the first file if multiple are selected
    if (file) {
      setFiles(prevFiles => [...prevFiles, file]);
    }
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        py: 3,
        px: 2.5,
      }}
    >
      <Avatar src={user?.photoURL} alt={user?.displayName} />

      <Paper
        variant="outlined"
        sx={{
          p: 1,
          flexGrow: 1,
          bgcolor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid white',
          boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(4px)',
          transition: 'box-shadow 0.3s',
          '&:hover': {
            boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.6)',
          },
        }}
      >
        <InputBase 
            key="messageInput"
            onChange={(e) => setMessage(e.target.value)} 
            value={message} 
            fullWidth 
            multiline 
            rows={2} 
            placeholder="Type a message" 
            sx={{ px: 1, flexGrow: 1 }} 
        />
        <Attachments files={files} handleRemoveFile={handleRemoveFile} />

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Switch
            checked={isPublic}
            onChange={handleSwitchChange}
            color="primary"
          />
          <Stack direction="row" flexGrow={1}>
            <IconButton onClick={() => document.getElementById('fileInput').click()}>
              <Iconify icon="eva:attach-2-fill" />
            </IconButton>
            <input 
              type="file" 
              id="fileInput" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
          </Stack>
          <Button
            key="buttonSend"
            variant="contained"
            sx={{
              backgroundColor: '#000000',
              color: 'white',
              transition: 'background-color 0.5s',
              '&:hover': {
                backgroundColor: '#FFFFFF',
                boxShadow: '8px 8px 8px rgba(0, 0, 0, 0.6)',
                color: 'black',
              },
            }}
            onClick={handleMessageSend}
          >
            {isPublic ? 'Public' : 'Private'} Message
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
