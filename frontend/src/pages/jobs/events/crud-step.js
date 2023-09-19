import React from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CreateIcon from '@mui/icons-material/Create';
import UpdateIcon from '@mui/icons-material/Update';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMediaQuery, useTheme } from '@mui/material';
import { fToNow } from '../../../utils/format-time';
import { zonedTimeToUtc } from 'date-fns-tz'; // Import 'zonedTimeToUtc'

export default function CrudStep({ event, member }) {
  let icon;
  let action;

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.only('md'));

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: '35px',
      boxSizing: 'border-box',
      margin: '0', // Remove margin
    },
    avatar: {
      backgroundColor: '#F2F3F4',
      border: '1px solid white',
      width: '25px',
      height: '25px',
      padding: '10px', // Add padding to the Avatar
      marginLeft: isSmallScreen
        ? 'calc(30% - 12px)'
        : isMediumScreen
        ? 'calc(35% - 12px)'
        : 'calc(25% - 12px)', // Set margin based on screen size with 5px offset
    },
    icon: {
      color: 'black',
      width: 20,
      height: 20,
    },
  };

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

  // Convert event.createdAt to 'Africa/Johannesburg' time zone.
  const createdAtInJohannesburg = zonedTimeToUtc(event.createdAt, 'Africa/Johannesburg');

  return (
    <div style={styles.container}>
      <Avatar style={styles.avatar}>{icon}</Avatar>
      <Typography variant="caption" style={{ fontSize: '12px', color: '#a8a8a8', paddingLeft: '20px' }}>
        {fToNow(createdAtInJohannesburg)} {/* Use the converted time */}
      </Typography>
      <Typography variant="subtitle2" style={{ fontSize: '12px', color: '#a8a8a8', paddingLeft: '20px' }}>
        {member && member?.displayName}
      </Typography>
      <Typography variant="subtitle2" style={{ fontSize: '12px', color: '#a8a8a8', paddingLeft: '20px' }}>
        {`${action} the event`}
      </Typography>
    </div>
  );
}
