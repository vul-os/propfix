// @mui
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
// hooks
import { useMockedUser } from '../../hooks/use-mocked-user';
// components
import Iconify from '../../components/iconify';

// ---------------------------------------------------------------------

export default function KanbanDetailsCommentInput() {
  const { user } = useMockedUser();

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

      <Paper variant="outlined" sx={{ p: 1, flexGrow: 1, bgcolor: 'transparent' }}>

        <Stack direction="row" alignItems="center">
          <InputBase fullWidth multiline rows={2} placeholder="Type a message" sx={{ px: 1 }} />
          <Button variant="contained">Comment</Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
