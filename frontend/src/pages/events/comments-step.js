import React from 'react';
import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { fToNow } from '../../utils/format-time';
import Lightbox, { useLightBox } from '../../components/lightbox';

// Define colors for public and private comments
const PUBLIC_COMMENT_COLOR = 'primary';
const PRIVATE_COMMENT_COLOR = 'info';

export default function CommentStep({ avatarUrl, name, createdAt, messageType, text }) {
  const slides = messageType === 'image' ? [{ src: text }] : [];

  const lightbox = useLightBox(slides);

  // Determine the color of the comment based on the message type
  const commentColor = messageType === 'public' ? PUBLIC_COMMENT_COLOR : PRIVATE_COMMENT_COLOR;

  return (
    <Stack direction="row" spacing={2}>
      <Avatar src={avatarUrl} />

      <Stack spacing={messageType === 'image' ? 1 : 0.5} flexGrow={1}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2">{name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {fToNow(createdAt)}
          </Typography>
        </Stack>

        {messageType === 'image' ? (
          <Lightbox
            index={lightbox.selected}
            slides={slides}
            open={lightbox.open}
            close={lightbox.onClose}
          />
        ) : (
          <Typography variant="body2">
            <Chip label={messageType} color={commentColor} size="small" sx={{ mr: 1 }} />
            {text}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}

CommentStep.propTypes = {
  avatarUrl: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  createdAt: PropTypes.string.isRequired,
  messageType: PropTypes.oneOf(['public', 'private']).isRequired,
  text: PropTypes.string.isRequired,
};
