import React from 'react';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CreateIcon from '@mui/icons-material/Create'; // Material Icons
import UpdateIcon from '@mui/icons-material/Update';
import DeleteIcon from '@mui/icons-material/Delete';
import { fToNow } from '../../../utils/format-time';

const styles = {
  containerWrapper: {
    display: 'flex',
    flexDirection: 'row', // Change the flexDirection to 'row'
    alignItems: 'center', // Align items in the center vertically
  },
  verticalLine: {
    width: '2px',
    backgroundColor: '#ddd',
    height: '15px', // Take up full height
    marginRight: '16px', // Adjust the margin as needed
  },
  iconContainer: {
    display: 'flex',
    flexDirection: 'column', // Align icon and content vertically
    alignItems: 'center', // Center icon and content horizontally
    marginLeft: '16px', // Add a margin to align the icon and line horizontally
  },
  icon: {
    width: '24px',
    height: '24px',
  },
};

export default function CrudStep({ event }) {
  let icon;
  let action;

  if (event.type === 'CREATE') {
    icon = <CreateIcon style={styles.icon} />;
    action = 'created';
  } else if (event.type === 'UPDATE') {
    icon = <UpdateIcon style={styles.icon} />;
    action = 'updated';
  } else if (event.type === 'DELETE') {
    icon = <DeleteIcon style={styles.icon} />;
    action = 'deleted';
  }

  return (
    <Stack direction="row" spacing={2}>
      <div style={styles.verticalLine}/>
      <div style={styles.containerWrapper}>
        <div style={styles.iconContainer}>{icon}</div>
        <Stack spacing={0.5} flexGrow={1}>
          <Typography variant="subtitle2">{event.name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {fToNow(event.createdAt)}
          </Typography>
          <Typography variant="body2">
            {action} the event
          </Typography>
        </Stack>
      </div>
    </Stack>
  );
}
