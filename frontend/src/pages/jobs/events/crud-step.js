import React from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CreateIcon from '@mui/icons-material/Create'; // Material Icons
import UpdateIcon from '@mui/icons-material/Update';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import { fToNow } from '../../../utils/format-time';


export default function CrudStep({ event }) {
  let icon;
  let action;

  if (event.type === 'CREATE') {
    icon = <CreateIcon />;
    action = 'created';
  } else if (event.type === 'UPDATE') {
    icon = <UpdateIcon />;
    action = 'updated';
  } else if (event.type === 'DELETE') {
    icon = <DeleteIcon />;
    action = 'deleted';
  }

  return (
    <Box display="flex" alignItems="center" sx={{
      paddingTop: '35px', 
      paddingLeft: '20px',
      paddingRight: '20px',
    }}>
      <Avatar
        sx={{
          bgcolor: 'rgb(255, 26, 91)',
          boxShadow: '0 3px 3px rgba(0, 0, 0, 0.9)',
          width: 25,
          height: 25,
          border: '1px solid grey',
          marginLeft: '20%',
        }}
      >
        {icon}
      </Avatar>
      <Typography
        style={{
          textTransform: 'capitalize',
          fontSize: '12px', // Adjust the font size for this Typography component
          marginLeft: '45px',
        }}
      >
        {action} the event
      </Typography>
      <Typography variant="caption" sx={{
        color: 'text.disabled',
        marginRight: '10px',
        fontSize: '12px', // Adjust the font size for this Typography component
      }}>
        {fToNow(event.createdAt)}
      </Typography>
    </Box>
  );
}
