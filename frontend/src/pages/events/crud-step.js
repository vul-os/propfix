import React from 'react';
import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { fToNow } from '../../utils/format-time';

export default function CRUDStep({ avatarUrl, name, createdAt, messageType }) {
  return (
    <Stack direction="row" spacing={2}>
      <Avatar src={avatarUrl} />

      <Stack spacing={0.5} flexGrow={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2">{name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {fToNow(createdAt)}
          </Typography>
        </Stack>

        <Typography variant="body2">
          <Chip label={messageType} color="primary" size="small" sx={{ mr: 1 }} />
          {`${messageType} event`}
        </Typography>
      </Stack>
    </Stack>
  );
}

CRUDStep.propTypes = {
  avatarUrl: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  messageType: PropTypes.oneOf(['create', 'update', 'delete']).isRequired,
};
