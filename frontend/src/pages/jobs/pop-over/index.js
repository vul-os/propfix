import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import moment from 'moment';
// @mui
import { styled, alpha } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';

import { useAuthContext } from '../../../contexts/auth'; 
import { useBoardContext } from '../../../contexts/board'; 
import { getAllEvents, createEvent } from '../../../api/events';
import { updateJob, deleteJob, closeJob, reOpenJob } from '../../../api/jobs';
import { moveJob } from '../../../api/columnJobLinks';
import { uploadFile, getFile, deleteFile } from '../../../api/attachments';

import Scrollbar from '../../../components/scrollbar';

// hooks
import { useBoolean } from '../../../hooks/use-boolean';
// components
import EventsList from '../events/events-list';
import MessageInput from './message-input';

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
  const { getIdToken, user, activeOrganization } = useAuthContext(); 
  const { board, setBoard, boardLoading, jobs, setJobs } = useBoardContext(); // Use the BoardProvider context
  const [selectedColumnMap, setSelectedColumnMap] = useState({});
  const [newJob, setNewJob] = useState({...job});

  const [events, setEvents] = useState([]); // State for the switch
  const [files, setFiles] = useState([]);

  
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
      setFiles([])
      setNewJob({...job})
      fetchEvents();

      // Check if attachments exist on the job
      if (job.attachments && job.attachments.length > 0) {
        fetchFiles();
      }
    }
  }, [job]);

  async function urlToFile(url, filename, mimeType) {
    // Fetch the file data as a blob
    console.log(url)
    const response = await fetch(url);
    console.log("resp", response)
    if (!response.ok) {
        
        throw new Error('Network response was not ok');
    }
    const blob = await response.blob();

    // Create a file from the blob
    const file = new File([blob], filename, { type: mimeType || blob.type });

    return file;
  } 

  const handleCloseJob = useCallback(
    async () => {
      try {
        const token = await getIdToken(); // Get the JWT token from the auth context
        const res = await closeJob(job.id, token); // Pass the token to the deleteJob function
        onClosePopOver()
        console.log(res)
        if (res?.success) {
          const newBoardJobs = { ...board.jobs };
          const currentDateTime = moment().utc().format('YYYY-MM-DDTHH:mm:ss[Z]'); 

          const newJ = {...job}
          newJ.closedAt = currentDateTime
          const newJobs = jobs.filter(j => j.id !== job.id);
          const newnewJobs = [...newJobs, newJ]
          newBoardJobs[job.id] = newJ
          // console.log(board, newBoardJobs, job.id)

          const cols = { ...board.columns }
          const updatedColumns = Object.fromEntries(
            Object.entries(cols).map(
              ([columnKey, columnValue]) => [
                columnKey, 
                { ...columnValue, jobIds: columnValue.jobIds.filter(id => id !== job.id) }
              ]
            )
          );
          setBoard({...board, jobs: newBoardJobs, columns: updatedColumns})
          setJobs(newnewJobs)
        } 
      } catch (error) {
        console.error(error);
      }
    },
    [getIdToken, enqueueSnackbar, board, job]
  );



  const handleReOpenJob = useCallback(
    async () => {
      try {

        const token = await getIdToken(); // Get the JWT token from the auth context
        const res = await reOpenJob(job.id, token); // Pass the token to the deleteJob function
        onClosePopOver()
        console.log(res)
        if (res?.success) {
          const newBoardJobs = { ...board.jobs };

          const newJ = {...job}
          newJ.closedAt = '0001-01-01T00:00:00Z'
          const newJobs = jobs.filter(j => j.id !== job.id);
          const newnewJobs = [...newJobs, newJ]
          newBoardJobs[job.id] = newJ

          const cols = { ...board.columns }
          const updatedColumns = Object.fromEntries(
            Object.entries(cols).map(([columnId, columnData]) => {
              if (columnData.name === 'New Jobs') {
                return [columnId, { ...columnData, jobIds: [...columnData.jobIds, job.id] }];
              }
              return [columnId, columnData];
            })
          );
          setBoard({...board, jobs: newBoardJobs, columns: updatedColumns})
          setJobs(newnewJobs)
        }
      } catch (error) {
        console.error(error);
      }
    },
    [getIdToken, enqueueSnackbar, board]
  );

  const handleDrop = async (acceptedFiles) => {
      try {
        const idToken = await getIdToken();
        console.log(acceptedFiles)
        // Use Promise.all to upload all files concurrently
        const uploadedFiles = await Promise.all(acceptedFiles.map(file => uploadFile(job.id, file, idToken)));
        console.log(uploadedFiles)
        const updatedFiles = [...files, ...acceptedFiles];
        
        // Extract objectNames from all uploaded files
        const uploadedObjectNames = uploadedFiles.map(file => file.objectName);
        
        const updatedAttachments = [...newJob.attachments, ...uploadedObjectNames];
        
        setFiles(updatedFiles);
        setNewJob(prevJob => ({
          ...prevJob,
          attachments: updatedAttachments,
        }));

        // Return the object names of all uploaded files
        return uploadedObjectNames;

      } catch (error) {
        console.error('Error adding file:', error);
        throw error;  // if you want to propagate the error outside
      }
  };


  const handleRemoveFile = useCallback(
    async (inputFile) => {
      try {
        const token = await getIdToken(); 

        await deleteFile(job.id, inputFile.name, token);

        // Filter the files and update the state
        setFiles((prevFiles) => prevFiles.filter((file) => file !== inputFile));
      } catch (error) {
        console.error('Error removing file:', error);
      }
    },
    [job.id]
  );

  const fetchFiles = async () => {
    try {
        const token = await getIdToken(); // Get the token once for all requests

        // Start all the getFile requests concurrently
        const filePromises = job.attachments.map(attachment => getFile(attachment, token));

        // Wait for all promises to resolve
        const newFiles = await Promise.all(filePromises);
        const filteredFiles = newFiles.filter(Boolean);

        // Convert signedUrls to File objects
        const fileObjPromises = filteredFiles.map(f => urlToFile(f.signedUrl, f.objectName)); // Modify filename accordingly
        const fileObjects = await Promise.all(fileObjPromises);

        // Update state with File objects
        setFiles(fileObjects);

    } catch (error) {
        console.error('Error fetching files:', error);
    }
  };

  function objectsHaveSameValues(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }
    // console.log(obj1, obj2)
    // console.log(keys1.every(key => obj1[key] === obj2[key]))

    return keys1.every(key => obj1[key] === obj2[key]);
  }


  const handleUpdateJob = useCallback(
    async (newJob) => {
      try {
        if (!objectsHaveSameValues(newJob, job)) {
          const token = await getIdToken(); // Get the JWT token from the auth context
          const res = await updateJob(newJob, token); // Pass the token to the deleteJob function
          if (!!res.success) enqueueSnackbar('Job updated!', {
            anchorOrigin: { vertical: 'top', horizontal: 'center' },
          });
        }
      } catch (error) {
        console.error(error);
      }
    },
    [getIdToken, enqueueSnackbar, job]
  );

  const handleDeleteJob = useCallback(
    async () => {
      try {
        const token = await getIdToken(); // Get the JWT token from the auth context
        const res = await deleteJob(job.id, token); // Pass the token to the deleteJob function
        onClosePopOver()
        console.log(res)
        if (res?.success) {
          const newBoardJobs = { ...board.jobs };
          delete newBoardJobs[job.id];

          const newJobs = jobs.filter(j => j.id !== job.id);
          console.log(board, newBoardJobs, job.id)

          setBoard({...board, jobs: newBoardJobs})
          setJobs(newJobs)

          // await fetchEvents()
          // enqueueSnackbar('Job deleted!', {
          //   anchorOrigin: { vertical: 'top', horizontal: 'center' },
          // });
        } 
      } catch (error) {
        console.error(error);
      }
    },
    [getIdToken, enqueueSnackbar, board, job]
  );

  const onChangeColumn = async (jobId, newSelectedColumn, selectedColumn) => {  
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
        setBoard(newBoardState);
        setSelectedColumnMap(prevMap => ({
          ...prevMap,
          [job.id]: newSelectedColumn
        }));
        const token = await getIdToken(); // Get the JWT token from the auth context
        await moveJob(
          selectedColumn?.id,
          newSelectedColumn?.id,
          job.id,
          0,
          token 
        );
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

  const createMessage = async (message, visibility, attachments) => {
      try {
          if (message !== "" || attachments?.length > 0) {
            const newEvent = {
                "type": "MESSAGE",
                "jobId": job.id,
                "visibility": visibility ? "public" : "private",
                "data": { "message": message }
            };
            if (attachments?.length > 0) {
              console.log(attachments)
              newEvent.data = {
                "message": message,
                "attachments": attachments
              }
            }
            const idToken = await getIdToken();
            const rEvent = await createEvent(newEvent, idToken);
            if (!!rEvent?.event) {
              let oldEvents = []
              if (events) oldEvents = [...events]
              console.log(rEvent)
              setEvents([...oldEvents, rEvent.event]);
            }
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
        onCloseJob={handleCloseJob}
        onReOpenJob={handleReOpenJob}
        onClosePopOver={onClose}
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
            pt: 1,
            pb: 5,
            px: 2.5,
          }}
        >
          <JobDetails job={newJob} setJob={setNewJob} buildings={board?.buildings} members={board?.members} labels={board?.labels} files={files} handleDrop={handleDrop} handleRemoveFile={handleRemoveFile} />
          <EventsList events={events} members={board?.members} attachments={files} />
        </Stack>
      </Scrollbar>
      <MessageInput user={user} handleDrop={handleDrop} createMessage={createMessage} activeOrganization={activeOrganization} />

    </Drawer>
  );
}
