import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { fToNow } from '../../../utils/format-time';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '8px',
    padding: '12px',
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    backgroundColor: 'rgb(255, 26, 91)',
    boxShadow: '0 3px 3px rgba(0, 0, 0, 0.9)',
  },
  messageBox: {
    position: 'relative',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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
    border: '1px solid grey',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 5px 5px rgba(0, 0, 0, 0.4)',
    position: 'relative',
  },
};

export default function MessageStep({ event }) {
  const messageBoxStyle =
    event.data.visibility === 'public'
      ? styles.publicMessageBox
      : styles.privateMessageBox;

  return (
    <div style={styles.container}>
      <Avatar src="dummy-avatar-url" style={styles.userAvatar} />
      <div style={messageBoxStyle}>
        <div style={styles.notch} />
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
