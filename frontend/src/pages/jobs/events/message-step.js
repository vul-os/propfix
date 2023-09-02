import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { fToNow } from '../../../utils/format-time';

const styles = {
  containerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', // Center horizontally
  },
  verticalLine: {
    width: '10px',
    backgroundColor: '#ddd',
    marginRight: '50%', // Set the marginRight to 75% of the parent's width
    height: '15px', // Take up full height
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  userAvatar: {
    width: '32px',
    height: '32px',
  },
  messageBox: {
    position: 'relative',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderTop: '1px solid #ddd', // Add top border
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
  },
  notch: {
    position: 'absolute',
    top: '50%',
    left: '-8px',
    transform: 'translateY(-50%) rotate(45deg)',
    width: '16px',
    height: '16px',
    backgroundColor: 'white',
    border: '1px solid #ddd',
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
    marginRight: '8px',
  },
  publicMessageBox: {
    backgroundColor: 'white',
    border: '1px solid green',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'relative',
  },
  privateMessageBox: {
    backgroundColor: 'white',
    border: '1px solid red',
    borderRadius: '8px',
    padding: '12px',
    paddingBottom: 0,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'relative',
  },
};

export default function MessageStep({ event }) {
  const messageBoxStyle =
    event.data.visibility === 'public'
      ? styles.publicMessageBox
      : styles.privateMessageBox;

  return (
    <div style={styles.containerWrapper}>
      <div style={styles.verticalLine}/>
      <div style={styles.container}>
        <Avatar src="dummy-avatar-url" style={styles.userAvatar} />
        <div style={{ ...messageBoxStyle, ...styles.messageBox }}>
          <div style={styles.notch}/>
          <div style={styles.titleSection}>
            <Typography variant="subtitle2" style={styles.titleText}>
              {event.data.username}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Messaged {fToNow(event.createdAt)}
            </Typography>
          </div>
          <Typography variant="body2">{event.data.message}</Typography>
        </div>
      </div>
    </div>
  );
}

MessageStep.propTypes = {
  event: PropTypes.shape({
    createdAt: PropTypes.string.isRequired,
    data: PropTypes.shape({
      username: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      visibility: PropTypes.oneOf(['public', 'private']).isRequired,
    }).isRequired,
  }).isRequired,
};
