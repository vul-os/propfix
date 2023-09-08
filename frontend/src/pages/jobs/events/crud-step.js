import React from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CreateIcon from '@mui/icons-material/Create';
import UpdateIcon from '@mui/icons-material/Update';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMediaQuery, useTheme } from '@mui/material';
import { fToNow } from '../../../utils/format-time';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: '35px',
    paddingLeft: '20px',
    paddingRight: '20px',
    boxSizing: 'border-box',
    margin: '0', // Remove margin
  },
  blankDiv: {
    width: '20px',
    margin: '0', // Remove margin
  },
  avatar: {
    backgroundColor: '#F2F3F4',
    border: '1px solid white',
    padding: '15px',
    marginLeft: '52px', // Adjust margin
    width: '20px',
    height: '20px',
  },
  icon: {
    color: 'black',
    width: 20,
    height: 20,
  },
};

export default function CrudStep({ event, member }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isLaptop = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

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
    <div style={styles.container}>
      <div style={styles.blankDiv} />
      <Avatar style={styles.avatar}>{icon}</Avatar>
      <Typography variant="caption" style={{ fontSize: '12px', color: '#a8a8a8', paddingLeft: '20px' }}>
        {fToNow(event.createdAt)}
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
