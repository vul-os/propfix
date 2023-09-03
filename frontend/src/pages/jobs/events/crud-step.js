import React from 'react';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CreateIcon from '@mui/icons-material/Create'; // Material Icons
import UpdateIcon from '@mui/icons-material/Update';
import DeleteIcon from '@mui/icons-material/Delete';
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
    <Stack direction="row" spacing={2}>
      <Stack spacing={0.5} flexGrow={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2">{event.name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {fToNow(event.createdAt)}
          </Typography>
        </Stack>
        <Typography variant="body2">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ bgcolor: 'rgb(255, 26, 91)',  boxShadow: '0 3px 3px rgba(0, 0, 0, 0.7)', width: 30, height: 30, border: '1px solid grey', marginLeft: '15px', padding: '1px' }}>
              {icon}
            </Avatar>
            <p style={{ marginLeft: '10px', textAlign: 'center', textTransform: 'capitalize', fontSize: '15px' }}>{action} the event</p> {/* Adjust the fontSize value as needed */}
          </Stack>
        </Typography>
      </Stack>
    </Stack>
  );
}
