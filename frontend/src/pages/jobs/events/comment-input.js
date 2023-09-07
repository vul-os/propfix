import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import InputBase from '@mui/material/InputBase';
import Switch from '@mui/material/Switch';
import { createEvent } from '../../../api/events';
import { useAuthContext } from '../../../contexts/auth';

export default function CommentInput({ user }) {
  const [isPublic, setIsPublic] = useState(false); // State for the switch
  const { getIdToken } = useAuthContext();
  const handleSwitchChange = () => {
    setIsPublic(!isPublic);
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
        <InputBase fullWidth multiline rows={2} placeholder="Type a message" sx={{ px: 1, flexGrow: 1 }} />

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {/* Switch component */}
          <Switch
            checked={isPublic}
            onChange={handleSwitchChange}
            color="primary"
          />

          {/* Button */}
          <Button
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
          >
            {isPublic ? 'Public' : 'Private'} Message
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
