import React from 'react';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CreateIcon from '@mui/icons-material/Create';
import UpdateIcon from '@mui/icons-material/Update';
import DeleteIcon from '@mui/icons-material/Delete';
import { fToNow } from '../../../utils/format-time'; // Adjust this import path as needed

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
    backgroundColor: '#F2F3F4',
    border: '1px solid white',
    padding: '15px', // Adjust padding to center the smaller icon
    marginLeft: '40px',
    width: '20px',
    height: '20px',

  },
  icon: {
    color: 'black', // Set the icon color to black
    width: 120, // Adjust the width to make the icon smaller
    height: 20, // Adjust the height to make the icon smaller
  },
};

export default function CrudStep({ event, member }) {
  let icon;
  let action;
  console.log(member);
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
      <div style={styles.blankDiv} /> {/* Blank div */}
      <Avatar style={styles.avatar}>
        {icon}
      </Avatar>
      <Typography variant="caption" style={{ fontSize: '12px', color: '#a8a8a8', paddingLeft: '50px' }}>
        {fToNow(event.createdAt)}
      </Typography>

            <Typography variant="subtitle2" style={{ fontSize: '12px', color: '#a8a8a8', paddingLeft: '50px' }}>
        {member && member.displayName ? member.displayName : extractEmailUsername(member.email)}
      </Typography>

      <Typography variant="subtitle2" style={{ fontSize: '12px',  color: '#a8a8a8', paddingLeft: '50px' }}>
        {`${action} the event`}
      </Typography>
    </div>
  );
}
