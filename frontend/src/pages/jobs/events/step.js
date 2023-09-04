import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CreateIcon from '@mui/icons-material/Create';
import UpdateIcon from '@mui/icons-material/Update';
import DeleteIcon from '@mui/icons-material/Delete';
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
    border: '1px solid red',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'relative',
  },
};

export default function Step({ event }) {
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

  const isCrudStep = action !== undefined;
  const messageBoxStyle =
    event.data && event.data.visibility === 'public'
      ? styles.publicMessageBox
      : styles.privateMessageBox;

  return (
    <div style={styles.container}>
      {isCrudStep ? null : <Avatar src="dummy-avatar-url" style={styles.userAvatar} />}
      <div style={isCrudStep ? null : messageBoxStyle}>
        {isCrudStep ? null : <div style={styles.notch} />}
        {isCrudStep ? (
          <Stack direction="row" spacing={2}>
            <Stack spacing={0.5} flexGrow={1}>
              <Typography variant="subtitle2">{event.name}</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {fToNow(event.createdAt)}
              </Typography>
            </Stack>
            <Typography variant="body2">
              {icon} {action} the event
            </Typography>
          </Stack>
        ) : (
          <>
            <div style={styles.titleSection}>
              <Typography variant="subtitle2" style={styles.titleText}>
                {event.data.username || event.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {fToNow(event.createdAt)}
              </Typography>
            </div>
            <Typography variant="body2">
              {icon} {action === undefined ? 'messaged' : action} the event
              {event.data.message && `: ${event.data.message}`}
            </Typography>
          </>
        )}
      </div>
    </div>
  );
}

Step.propTypes = {
  event: PropTypes.shape({
    createdAt: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['CREATE', 'UPDATE', 'DELETE']),
    data: PropTypes.shape({
      username: PropTypes.string,
      message: PropTypes.string,
      visibility: PropTypes.oneOf(['public', 'private']),
    }),
    name: PropTypes.string,
  }).isRequired,
};
