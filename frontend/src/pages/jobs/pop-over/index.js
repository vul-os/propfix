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
  const { board, setBoard, boardLoading } = useBoardContext(); // Use the BoardProvider context
  const [selectedColumnMap, setSelectedColumnMap] = useState({});


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

  const setColumnByJobId = (jobId, columnValue) => {
    setSelectedColumnMap(prevMap => ({
      ...prevMap,
      [jobId]: columnValue
    }));
  };

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

  const onChangeColumn = (jobId, newSelectedColumn, selectedColumn) => {

  
      if (newSelectedColumn && newSelectedColumn.jobIds) {
        // Get a copy of job ids from source column
        const newStartJobIds = Array.from(selectedColumn && selectedColumn.jobIds || []).filter(id => id !== jobId);
        // Get a copy of job ids from destination column
        const newEndJobIds = [...Array.from(newSelectedColumn.jobIds || []), jobId];

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
        if (newStartJobIds.length > 0) {
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
        console.log("heree: ", newStartJobIds, newEndJobIds)
        setBoard(newBoardState);
      }

          // actually do api request
          // await moveJob(
          //   sourceColumn.id,
          //   destinationColumn.id,
          //   draggableId,
          //   destination.index,
          //   token 
          // );
  }

  const onClosePopUp = () => {

  }

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
        job={job}
        onDelete={handleDeleteJob}
        onChangeColumn={onChangeColumn}
        onClosePopUp={onClosePopUp}
        columns={board && board.columns}
        selectedColumnMap={selectedColumnMap}
        setColumnByJobId={setColumnByJobId}
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
