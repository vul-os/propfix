import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

// @mui
import { styled, alpha } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

import { useAuthContext } from '../../../contexts/auth'; 

import Scrollbar from '../../../components/scrollbar';

// hooks
import { useBoolean } from '../../../hooks/use-boolean';
// components
import EventsList from '../events/events-list';
import CommentInput from '../events/comment-input';

import Toolbar from './toolbar';
import JobDetails from '../job';

dayjs.extend(utc);

// ----------------------------------------------------------------------

const StyledLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: 100,
  flexShrink: 0,
  color: theme.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
}));

function enqueueSnackbar(message, options) {
  console.log('Snackbar:', message, options);
}
// ----------------------------------------------------------------------

export default function PopOver({
  job,
  openPopOver,
  onClosePopOver,
}) {
  const { getIdToken, user } = useAuthContext(); 
  console.log("jobprop", job)
  const handleAddJob = useCallback(
    async (jobData) => {
      try {
        const token = await getIdToken(); // Get the JWT token from the auth context
        // createJob(column.id, jobData, token); // Pass the token to the createJob function

        // openAddJob.onFalse();
      } catch (error) {
        console.error(error);
      }
    },
    [getIdToken] // Include getIdToken in the dependencies array
  );

  const handleDeleteJob = useCallback(
    async (jobId) => {
      try {
        const token = await getIdToken(); // Get the JWT token from the auth context
        // deleteJob(jobId, token); // Pass the token to the deleteJob function

        enqueueSnackbar('Delete success!', {
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
        });
      } catch (error) {
        console.error(error);
      }
    },
    [getIdToken, enqueueSnackbar]
  );

  return (
    <Drawer
      open={openPopOver}
      onClose={onClosePopOver}
      anchor="right"
      slotProps={{
        backdrop: { invisible: true },
      }}
      PaperProps={{
        sx: {
          width: {
            xs: 1,
            sm: 480,
          },
        },
      }}
    >
      <Toolbar
        jobName={job.name}
        jobStatus={job.status}
        onDelete={handleDeleteJob}
        onClosePopOver={onClosePopOver}
      />
      <Divider />
      <Scrollbar
        sx={{
          height: 1,
          '& .simplebar-content': {
            height: 1,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Stack
          spacing={3}
          sx={{
            pt: 3,
            pb: 5,
            px: 2.5,
          }}
        >
          <JobDetails job={job} />
          <EventsList jobId={job.id} />
        </Stack>
      </Scrollbar>
      <CommentInput user={user} />

    </Drawer>
  );
}

PopOver.propTypes = {
  onClosePopOver: PropTypes.func,
  openPopOver: PropTypes.bool,
  job: PropTypes.object,
};
