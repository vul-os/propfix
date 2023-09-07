import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { alpha } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Iconify from '../../components/iconify';
import { useBoolean } from '../../hooks/use-boolean';
import { useSnackbar } from '../../components/snackbar';
import KanbanJobItem from './kanban-job-item';
import { useAuthContext } from '../../contexts/auth';
import KanbanJobAdd from './kanban-job-add';

export default function KanbanColumn({ column, jobs, setJob, members, openPopUp, setOpenPopUp, index }) {
  const openAddJob = useBoolean();

  const renderAddJob = (
    <Stack
      spacing={2}
      sx={{
        pb: 3,
      }}
    >
      {openAddJob.value && (
        <KanbanJobAdd
          status={column.name}
          onAddTask={() => null}
          onCloseAddTask={openAddJob.onFalse}
        />
      )}

      <Button
        fullWidth
        size="large"
        color="inherit"
        startIcon={
          <Iconify
            icon={openAddJob.value ? 'solar:close-circle-broken' : 'mingcute:add-line'}
            width={18}
            sx={{ mr: -0.5 }}
          />
        }
        onClick={openAddJob.onToggle}
        sx={{ fontSize: 14 }}
      >
        {openAddJob.value ? 'Close' : 'Add Task'}
      </Button>
    </Stack>
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
                  {column.jobIds &&
                    column.jobIds.map((jobId, jobIndex) => {
                      const theJob = jobs.find((job) => job && job.id === jobId);
                      if (theJob) {
                        return (
                          <KanbanJobItem
                            key={jobId}
                            index={jobIndex}
                            job={theJob}
                            openPopUp={openPopUp}
                            setOpenPopUp={setOpenPopUp}
                            setJob={setJob}
                            members={members}
                          />
                        );
                      }
                      return null;
                    })}
                  {dropProvided.placeholder}
                </Stack>
              )}
            </Droppable>

            {renderAddJob}
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
