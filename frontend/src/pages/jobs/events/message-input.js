import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import InputBase from '@mui/material/InputBase';
import Switch from '@mui/material/Switch';

export default function MessageInput({ user, createMessage, activeOrganization }) {
  const [isPublic, setIsPublic] = useState(activeOrganization === ""); // State for the switch
  const [message, setMessage] = useState(""); // State for the switch

  const handleSwitchChange = () => {
    if (activeOrganization !== "") setIsPublic(!isPublic);
  };

  const handleMessageSend = async () => {
    try {
      console.log("message", message)
        await createMessage(message, isPublic);
        setMessage(""); // optionally, clear the message after sending
    } catch (error) {
        console.error("Failed to send message:", error);
    }
}


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
          value={message}  // This will bind the input's value to the state
          fullWidth 
          multiline 
          rows={2} 
          placeholder="Type a message" 
          sx={{ px: 1, flexGrow: 1 }} 
      />

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {/* Switch component */}
          <Switch
            checked={isPublic}
            onChange={handleSwitchChange}
            color="primary"
          />

          {/* Button */}
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
