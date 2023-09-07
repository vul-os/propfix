import React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import InputBase from '@mui/material/InputBase';

export default function CommentInput({ user }) {
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
          border: '1px solid white', // Add black border
          boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.2)', // Add box shadow
          backdropFilter: 'blur(4px)', // Add blur effect
          transition: 'box-shadow 0.3s', // Add transition for the box shadow
          '&:hover': {
            boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.6)', // Adjust shadow on hover
          },
        }}
      >
        <InputBase fullWidth multiline rows={2} placeholder="Type a message" sx={{ px: 1, flexGrow: 1 }} />

        <Stack direction="row" alignItems="center" justifyContent="flex-end">
          {/* Updated button styling */}
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#000000', // Custom background color
              color: 'white', // Custom text color
              transition: 'background-color 0.5s', // Add transition for background color
              '&:hover': {
                backgroundColor: '#FFFFFF', // Adjust background color on hover
                boxShadow: '8px 8px 8px rgba(0, 0, 0, 0.6)', // Add hover box shadow
                color: 'black', // Change text color to black on hover
              },
            }}
          >
            Message
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
