import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Draggable } from '@hello-pangea/dnd';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup'; // Import AvatarGroup and avatarGroupClasses from MUI
import Chip from '@mui/material/Chip';
import LabelAutocomplete from '../labels/label-autocomplete'; // Import your LabelAutocomplete component
import Iconify from '../../components/iconify/iconify';
import { useBoolean } from '../../hooks/use-boolean';
import { bgBlur } from '../../theme/css';


export default function KanbanJobItem({ job, members, index, openPopUp, setOpenPopUp, setJob, sx, labels, selectedLabels, ...other }) {
  const theme = useTheme();
  console.log('Jib Item Assignees', job?.name, job?.assigneeIds);

  const priority = job && job.priority && job?.priority?.toLowerCase()
  const renderPriority = (
    <Iconify
      icon={
        (priority === 'low' && 'solar:double-alt-arrow-down-bold-duotone') ||
        (priority === 'medium' && 'solar:double-alt-arrow-right-bold-duotone') ||
        'solar:double-alt-arrow-up-bold-duotone'
      }
      sx={{
        position: 'absolute',
        top: 4,
        right: 4,
        ...(priority === 'low' && {
          color: 'info.main',
        }),
        ...(priority === 'medium' && {
          color: 'warning.main',
        }),
        ...(priority === 'hight' && {
          color: 'error.main',
        }),
      }}
    />
  );
  const RenderAvatarGroup = useCallback(() => {
    const assignees = job?.assigneeIds?.map((jobId) => members && members[jobId])
    return assignees && <AvatarGroup
      sx={{
        [`& .${avatarGroupClasses.avatar}`]: {
          width: 24,
          height: 24,
        },
      }}
    >
      {assignees.map((user) => {
        console.log(user)
        return <Avatar key={user?.id} alt={ user?.displayName} src={user?.photoUrl} />
      })}
    </AvatarGroup>   
  }, [job?.assigneeIds, members]);
 

  // const renderImg = (
  //   <Box
  //     sx={{
  //       p: theme.spacing(1, 1, 0, 1),
  //     }}
  //   >
  //     <Box
  //       component="img"
  //       alt={job.attachments[0]}
  //       src={job.attachments[0]}
  //       sx={{
  //         borderRadius: 1.5,
  //         ...(openDetails.value && {
  //           opacity: 0.8,
  //         }),
  //       }}
  //     />
  //   </Box>
  // );

  const renderInfo = (
    <Stack direction="row" alignItems="center">
      <Stack
        flexGrow={1}
        direction="row"
        alignItems="center"
        sx={{
          typography: 'caption',
          color: 'text.disabled',
        }}
      >
        {/* <Iconify width={16} icon="solar:chat-round-dots-bold" sx={{ mr: 0.25 }} />
        <Box component="span" sx={{ mr: 1 }}>
          {job.comments.length}
        </Box> */}

        <Iconify width={16} icon="eva:attach-2-fill" sx={{ mr: 0.25 }} />
        <Box component="span">{job?.attachments?.length}</Box>
      </Stack>

      <RenderAvatarGroup />
    </Stack>
  );


  const renderLabels = useCallback(() => {
    console.log('Labels prop:', labels); // Log the labels prop to the console
    if (labels) { // Use the 'labels' prop
      return (
        <Stack direction="row" alignItems="center" spacing={1}>
          {job.labelIds?.map((label) => {
            console.log('RenderLabels called'); // Add this line
            console.log('Label ID:', label);
            console.log('Label:', labels[label]);
            

            return (
              <Chip
                key={labels[label]?.id}
                label={labels[label]?.name}
                style={{ backgroundColor: labels[label]?.color, color: '#fff' }}
              />
            );
          })}
        </Stack>
      );
    }
    return null;
  }, [job, labels]); // Include 'job' and 'labels' in the dependencies array

 


  return (
    <>
      <Draggable draggableId={job.id} index={index}>
        {(provided, snapshot) => (
          <Paper
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => { setJob(job); setOpenPopUp(true)}}
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
              ...(openPopUp && {
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
              {renderPriority}

              <Typography sx={{marginTop: '0px !important'}} variant="subtitle2">{job.name}</Typography>

              {renderInfo}
              {renderLabels()} 
            </Stack>
            {/* <Stack spacing={2} sx={{ px: 2, py: 2.5, position: 'relative' }}>
              <Typography variant="subtitle2">{job.name}</Typography>
              {renderInfo}
            </Stack> */}
          </Paper>
        )}
      </Draggable>
    </>
  );
}

KanbanJobItem.propTypes = {
  job: PropTypes.object,
  members: PropTypes.object.isRequired,
  index: PropTypes.number,
  openPopUp: PropTypes.bool, // Update the prop type to func or make it optional
  setOpenPopUp: PropTypes.func,
  setJob: PropTypes.func,
  sx: PropTypes.func, // Make sx prop optional
  labels: PropTypes.oneOfType([PropTypes.array, PropTypes.object]), // Update the prop type to accept array or object
  selectedLabels: PropTypes.array,
};
