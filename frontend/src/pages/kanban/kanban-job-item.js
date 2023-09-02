import PropTypes from 'prop-types';
import { Draggable } from '@hello-pangea/dnd';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup'; // Import AvatarGroup and avatarGroupClasses from MUI
import { useBoolean } from '../../hooks/use-boolean';
import PopOver from '../jobs/pop-over';
import { bgBlur } from '../../theme/css';


export default function KanbanJobItem({ job, index, sx, ...other }) {
  const theme = useTheme();
  const openDetails = useBoolean();
  const renderInfo = (
    <Stack direction="row" alignItems="center">
      <AvatarGroup
        sx={{
          [`& .${avatarGroupClasses.avatar}`]: {
            width: 24,
            height: 24,
          },
        }}
      >
        {job.assignees && job.assignees.map((user) => (
          <Avatar key={user.id} alt={user.name} src={user.avatarUrl} />
        ))}
      </AvatarGroup>
    </Stack>
  );

  return (
    <>
      <Draggable draggableId={job.id} index={index}>
        {(provided, snapshot) => (
          <Paper
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={openDetails.onTrue}
            sx={{
              width: 1,
              borderRadius: 1.5,
              overflow: 'hidden',
              position: 'relative',
              bgcolor: 'background.default',
              boxShadow: theme.customShadows.z20,
              '&:hover': {
                boxShadow: theme.customShadows.z20,
              },
              ...(openDetails.value && {
                boxShadow: theme.customShadows.z20,
              }),
              ...(snapshot.isDragging && {
                boxShadow: theme.customShadows.z20,
                ...bgBlur({
                  opacity: 0.48,
                  color: theme.palette.background.default,
                }),
              }),
              ...sx,
            }}
            {...other}
          >
            <Stack spacing={2} sx={{ px: 2, py: 2.5, position: 'relative' }}>
              {/* {renderPriority} */}

              <Typography variant="subtitle2">{job.name}</Typography>

              {/* {renderInfo} */}
            </Stack>
            {/* <Stack spacing={2} sx={{ px: 2, py: 2.5, position: 'relative' }}>
              <Typography variant="subtitle2">{job.name}</Typography>
              {renderInfo}
            </Stack> */}
          </Paper>
        )}
      </Draggable>

      <PopOver
        job={job}
        openPopOver={openDetails.value}
        onClosePopOver={openDetails.onFalse}
      />
    </>
  );
}

KanbanJobItem.propTypes = {
  index: PropTypes.number,
  sx: PropTypes.object,
  job: PropTypes.object,
};
