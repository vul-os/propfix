import React from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CreateIcon from '@mui/icons-material/Create';
import UpdateIcon from '@mui/icons-material/Update';
import DeleteIcon from '@mui/icons-material/Delete';
import { fToNow } from '../../../utils/format-time'; // Adjust this import path as needed
import extractEmailUsername from '../../utility/email';

const styles = {
  container: {
    display: 'flex',
    width: 'calc(100% - 40px)', // Adjusting for the padding
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: '35px',
    paddingLeft: '20px',
    paddingRight: '20px',
    boxSizing: 'border-box', // Make sure padding is included in width
  },
  blankDiv: {
    width: '20%',
  },
  avatar: {
    width: 30,
    height: 30,
    backgroundColor: 'rgb(255, 26, 91)',
    boxShadow: '0 0 3px 2px rgba(255, 26, 91, 0.5)', // Updated box shadow
    border: '1px solid lightgrey',
  },
};

export default function CrudStep({ event, member }) {
  let icon;
  let action;
  console.log(member);
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
    <div style={styles.container}>
      <div style={styles.blankDiv} /> {/* Blank div */}
      <Avatar style={styles.avatar}>
        {icon}
      </Avatar>
      <Typography variant="subtitle2" style={{ color: '#a8a8a8',  paddingLeft: '50px' }}>
        {member && member.displayName ? member.displayName : extractEmailUsername(member.email)}
      </Typography>
      <Typography variant="subtitle2" style={{ color: '#a8a8a8',  paddingLeft: '50px' }}>
        {`${action} the event`}
      </Typography>
      <Typography variant="caption" style={{ color: '#a8a8a8', paddingLeft: '50px'}}>
        {fToNow(event.createdAt)}
      </Typography>
    </div>
  );
}
