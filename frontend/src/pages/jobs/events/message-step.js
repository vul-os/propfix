import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { fToNow } from '../../../utils/format-time';
import extractEmailUsername from './utils'

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
    width: '32px',
    height: '32px',
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
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'relative',
  },
};

export default function MessageStep({ event, member }) {
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
          { member && member.displayName ? member.displayName : extractEmailUsername(member.email) }
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
