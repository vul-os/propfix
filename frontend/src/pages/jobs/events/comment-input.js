import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

export default function CommentInput({ user }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        py: 3,
        px: 2.5,
      }}
    >
      <Avatar src={user?.photoURL} alt={user?.displayName} />

      <Paper variant="outlined" sx={{ p: 1, flexGrow: 1, bgcolor: 'transparent', display: 'flex', flexDirection: 'column' }}>
        <InputBase fullWidth multiline rows={2} placeholder="Type a message" sx={{ px: 1, flexGrow: 1 }} />

        <Stack direction="row" alignItems="center" justifyContent="flex-end">
          <Button variant="contained">Message</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
