import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

// @mui
import { styled, alpha } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

import { useAuthContext } from '../../../contexts/auth'; 
import { useBoardContext } from '../../../contexts/board'; 
import { getAllEvents, createEvent } from '../../../api/events';
import { updateJob, deleteJob } from '../../../api/jobs';

import Scrollbar from '../../../components/scrollbar';

// hooks
import { useBoolean } from '../../../hooks/use-boolean';
// components
import EventsList from '../events/events-list';
import MessageInput from '../events/message-input';

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
  const { board, setBoard, boardLoading } = useBoardContext(); // Use the BoardProvider context
  const [selectedColumnMap, setSelectedColumnMap] = useState({});
  const [newJob, setNewJob] = useState({...job});
  console.log("thejob", job, newJob)

  const [events, setEvents] = useState([]); // State for the switch

  
  useEffect(() => {
    const initialSelectedColumnMap = board && board.jobs && board.columns
    ? Object.fromEntries(
        Object.values(board.jobs).map((job) => {
          const columnObject = Object.values(board.columns).find((col) => col && col.jobIds && col.jobIds.includes(job.id)) || null;
          return [job.id, columnObject];
        })
      )
    : {};
    setSelectedColumnMap(initialSelectedColumnMap)
  }, [board])

  useEffect(() => {
    if (job.id) {
      setEvents([]);
      setNewJob({...job})
      fetchEvents();
    }

  }, [job]);


  const handleUpdateJob = useCallback(
    async (newJob) => {
      try {
        const token = await getIdToken(); // Get the JWT token from the auth context
        const res = await updateJob(newJob, token); // Pass the token to the deleteJob function
        if (!!res.success) enqueueSnackbar('Job updated!', {
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
        });
      } catch (error) {
        console.error(error);
      }
    },
    [getIdToken, enqueueSnackbar]
  );

  const handleDeleteJob = useCallback(
    async (newJob) => {
      try {
        const token = await getIdToken(); // Get the JWT token from the auth context
        const res = await deleteJob(job.id, token); // Pass the token to the deleteJob function
        if (!!res.success) enqueueSnackbar('Job deleted!', {
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
        });
      } catch (error) {
        console.error(error);
      }
    },
    [getIdToken, enqueueSnackbar]
  );

  const onChangeColumn = (jobId, newSelectedColumn, selectedColumn) => {
      console.log("dddddd", newSelectedColumn, selectedColumn,)
  
      if (newSelectedColumn && newSelectedColumn.jobIds) {
        // Get a copy of job ids from source column
        const newStartJobIds = Array.from(selectedColumn && selectedColumn.jobIds || []).filter(id => id !== jobId);
        // Get a copy of job ids from destination column
        const newEndJobIds = [...Array.from(newSelectedColumn.jobIds || []), jobId];
        console.log("fdddd", newEndJobIds, newStartJobIds)
        let newBoardState = {
          ...board,
          columns: {
            ...board.columns,
            [newSelectedColumn.id]: {
              ...newSelectedColumn,
              jobIds: newEndJobIds,
            },
          },
        };
        if (selectedColumn?.id && newSelectedColumn?.id) {
          // Create new board state
          newBoardState = {
            ...board,
            columns: {
              ...board.columns,
              [selectedColumn.id]: {
                ...selectedColumn,
                jobIds: newStartJobIds,
              },
              [newSelectedColumn.id]: {
                ...newSelectedColumn,
                jobIds: newEndJobIds,
              },
            },
          };
        }
        console.log("here212121e: ", newStartJobIds, newEndJobIds)
        setBoard(newBoardState);
        setSelectedColumnMap(prevMap => ({
          ...prevMap,
          [job.id]: newSelectedColumn
        }));
        // actually do api request
        // await moveJob(
        //   sourceColumn.id,
        //   destinationColumn.id,
        //   draggableId,
        //   destination.index,
        //   token 
        // );
      }

  }

  const onClose = () => {
    onClosePopOver()
    handleUpdateJob(newJob)
    setBoard({
      ...board,
      jobs: {
        ...board.jobs,
        [newJob.id]: newJob,
      },
    })
  }

  const fetchEvents = async () => {
    try {
      const idToken = await getIdToken();
      const allEvents = await getAllEvents(job.id, idToken);
      setEvents(allEvents.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const createMessage = async (message, visibility) => {
      try {
          if (message !== "" ) {
              const newEvent = {
                "type": "MESSAGE",
                "jobId": job.id,
                "visibility": visibility ? "public" : "private",
                "data": { "message": message }
            };
            const idToken = await getIdToken();
            const rEvent = await createEvent(newEvent, idToken);
            if (!!rEvent?.event) setEvents([...events, rEvent.event]);
          }
      } catch (error) {
          console.error('Error fetching events:', error);
      }
  };


  return (
    <Drawer
      open={openPopOver}
      onClose={onClose}
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
        job={job}
        onDelete={handleDeleteJob}
        columns={board && board.columns}
        onChangeColumn={onChangeColumn}
        selectedColumn={job && selectedColumnMap[job.id]}
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
          <JobDetails job={newJob} setJob={setNewJob} members={board?.members} labels={board?.labels} />
          <EventsList events={events} members={board?.members}/>
        </Stack>
      </Scrollbar>
      <MessageInput user={user} createMessage={createMessage} />

    </Drawer>
  );
}
