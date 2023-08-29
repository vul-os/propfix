import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { alpha } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useBoolean } from '../../hooks/use-boolean';
import { useSnackbar } from '../../components/snackbar';
import KanbanJobItem from './kanban-job-item';
import { useAuthContext } from '../../contexts/auth';


export default function KanbanColumn({ column, jobs, index }) {
  const { enqueueSnackbar } = useSnackbar();
  const openAddJob = useBoolean();
  const { getIdToken } = useAuthContext(); // Get the getIdToken function from the auth context

  const handleAddJob = useCallback(
    async (jobData) => {
      try {
        const token = await getIdToken(); // Get the JWT token from the auth context
        // createJob(column.id, jobData, token); // Pass the token to the createJob function

        openAddJob.onFalse();
      } catch (error) {
        console.error(error);
      }
    },
    [column.id, getIdToken, openAddJob] // Include getIdToken in the dependencies array
  );

  const handleUpdateJob = useCallback(async (jobData) => {
    try {
      const token = await getIdToken(); // Get the JWT token from the auth context
      // updateJob(jobData, token); // Pass the token to the updateJob function
    } catch (error) {
      console.error(error);
    }
  }, [getIdToken]);

  const handleDeleteJob = useCallback(
    async (jobId) => {
      try {
        const token = await getIdToken(); // Get the JWT token from the auth context
        // deleteJob(column.id, jobId, token); // Pass the token to the deleteJob function

        enqueueSnackbar('Delete success!', {
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
        });
      } catch (error) {
        console.error(error);
      }
    },
    [column.id, getIdToken, enqueueSnackbar]
  );

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            px: 2,
            borderRadius: 2,
            bgcolor: 'background.neutral',
            ...(snapshot.isDragging && {
              bgcolor: (theme) => alpha(theme.palette.grey[500], 0.24),
            }),
          }}
        >
          <Stack {...provided.dragHandleProps}>
            <Stack
              spacing={1}
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ pt: 3 }}
            >
              <Typography
                component="div"
                sx={{
                  py: 0.75,
                  borderRadius: 1,
                  borderWidth: 2,
                  borderStyle: 'solid',
                  borderColor: 'transparent',
                  transition: (theme) =>
                    theme.transitions.create(['padding-left', 'border-color']),
                  '&:focus': {
                    paddingLeft: 1.5,
                    borderColor: (theme) => theme.palette.text.primary,
                  },
                }}
              >
                {column.name}
              </Typography>
            </Stack>

            <Droppable droppableId={column.id} type="JOB">
              {(dropProvided) => (
                <Stack
                  ref={dropProvided.innerRef}
                  {...dropProvided.droppableProps}
                  spacing={2}
                  sx={{
                    py: 3,
                    width: 280,
                  }}
                >
                  {column.jobids &&
                    column.jobids.map((jobId, jobIndex) => {
                      const job = jobs.find((job) => job && job.id === jobId);
                      if (job) {
                        return (
                          <KanbanJobItem
                            key={jobId}
                            index={jobIndex}
                            job={job}
                            onUpdateJob={handleUpdateJob}
                            onDeleteJob={() => handleDeleteJob(jobId)}
                          />
                        );
                      }
                      return null;
                    })}
                  {dropProvided.placeholder}
                </Stack>
              )}
            </Droppable>
          </Stack>
        </Paper>
      )}
    </Draggable>
  );
}

KanbanColumn.propTypes = {
  column: PropTypes.object,
  index: PropTypes.number,
  jobs: PropTypes.array,
};
