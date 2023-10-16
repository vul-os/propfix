import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip'; // Import Chip component
import FaceIcon from '@mui/icons-material/Face';
import { fToNow } from '../../../utils/format-time';
import Attachments from '../../../components/attachments';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: '35px',
    paddingLeft: '20px',
    paddingRight: '20px',
    gap: '8px',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    backgroundColor: 'rgb(255, 26, 91)',
    border: '1px solid lightgrey',
    marginTop: '15px',
  },
  messageBox: {
    position: 'relative',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    paddingTop: '20px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  notch: {
    position: 'absolute',
    marginTop: '20px',
    left: '-8px',
    transform: 'translateY(-50%) rotate(45deg)',
    width: '16px',
    height: '16px',
    backgroundColor: 'white',
    border: '1px solid #cacaca',
    zIndex: -1,
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: '8px',
    borderRadius: '4px 4px 0 0',
  },
  titleText: {
    marginRight: '20px',
  },
  publicMessageBox: {
    backgroundColor: 'white',
    border: '1px solid #BEBFC5',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 7px 9px rgba(0, 0, 0, 0.5)',
    position: 'relative',
    marginLeft: '9px'
  },
  privateMessageBox: {
    backgroundColor: 'white',
    border: '1px solid #BEBFC5',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 7px 9px rgba(0, 0, 0, 0.5)',
    position: 'relative',
    marginLeft: '9px',
  },
  label: {
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    padding: '0', // Remove padding for labels
    marginRight: '10px',
  },
};

export default function MessageStep({ event, member, attachments }) {
  const messageBoxStyle =
    event.visibility === 'public'
      ? styles.publicMessageBox
      : styles.privateMessageBox;
  
  const renderVisibility = 
      event.visibility === 'public'
      ? <Chip label="Public" sx={{backgroundColor:'rgb(255, 26, 91)', borderRadius:'8px', marginRight:'10px'}}  />
      : <Chip label="Private" sx={{backgroundColor: 'black', borderRadius:'8px', marginRight:'10px' }} />;

  // Filter the actual file objects based on filenames in event.data.attachments
  const filesToDisplay = attachments.filter(file => 
    event.data?.attachments?.some(attachmentName => attachmentName.includes(file.name))
  );
    console.log(filesToDisplay, attachments,  event.data.attachments)
  return (
    <div style={styles.container}>
      <Avatar src={member?.photoUrl} style={styles.userAvatar} />
      <div style={messageBoxStyle}>
        <div style={styles.notch} />
        <div style={styles.titleSection}>
          {renderVisibility }
          <Typography variant="subtitle2" style={styles.titleText}>
            {member?.displayName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Messaged {fToNow(event.createdAt)}
          </Typography>
        </div>
        <Typography variant="body2">{event.data.message}</Typography>
        {filesToDisplay.length > 0 && (
          <Attachments files={filesToDisplay} />
        )}
      </div>


    </div>
  );
}