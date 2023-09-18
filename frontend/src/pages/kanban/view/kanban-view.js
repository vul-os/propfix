import { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import EmptyContent from '../../../components/empty-content';
import { moveJob } from '../../../api/columnJobLinks';
import { getBoard, createJob } from '../../../api/jobs';
import { hideScroll } from '../../../theme/css';

import KanbanColumn from '../kanban-column';
import { KanbanColumnSkeleton } from '../kanban-skeleton';
import { useAuthContext } from '../../../contexts/auth'; 
import { useBoardContext } from '../../../contexts/board'; 
import PopOver from '../../jobs/pop-over';

export default function KanbanView() {
  const { board, setBoard, boardLoading } = useBoardContext(); // Use the BoardProvider context
  const { getIdToken, activeOrganization } = useAuthContext(); 
  const [openPopUp, setOpenPopUp] = useState(false);
  const [job, setJob] = useState({});

  const onJobAdd = useCallback(
    async (name, columnId) => {
      try {
        const idToken = await getIdToken();
        const jobData = {
          name,
          labels: [],
          buildingId: "",
          attachments: [],
          organizationId: activeOrganization,
          priority: 'low',
        }
        const destinationColumn = board?.columns[columnId];
        
        const createdJob = await createJob(jobData, idToken);
        const jobId = createdJob.id
        
        if (jobId) {
          const newEndJobIds = [...Array.from(destinationColumn.jobIds || []), jobId];
          const newJob = jobData
          newJob.id = jobId
          const newBoardState = {
            ...board,
            columns: {
              ...board.columns,
              [columnId]: {
                ...destinationColumn,
                jobIds: newEndJobIds,
              },
            },
            jobs: {[jobId]: newJob, ...board.jobs}
          };
          setBoard(newBoardState)
        }
      } catch (error) {
        console.error('Error removing file:', error);
      }
    },
    [board, getIdToken]
  );

  const onDragEnd = useCallback(
    async ({ destination, source, draggableId, type }) => {
      const token = await getIdToken();
      
      try {
        // If no destination or no change in position, return.
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
          return;
        }

        const sourceColumn = board?.columns[source.droppableId];
        const destinationColumn = board?.columns[destination.droppableId];

        if (sourceColumn && destinationColumn) {
          // Get a copy of job ids from source column
          const newStartJobIds = Array.from(sourceColumn.jobIds || []);

          if (destination.droppableId === source.droppableId) {
            // Moving within the same column
            newStartJobIds.splice(source.index, 1);
            newStartJobIds.splice(destination.index, 0, draggableId);
          } else {
            // Moving between different columns
            newStartJobIds.splice(source.index, 1);
            const newEndJobIds = Array.from(destinationColumn.jobIds || []);
            newEndJobIds.splice(destination.index, 0, draggableId);

            // Update the destination column
            board.columns[destination.droppableId] = {
              ...destinationColumn,
              jobIds: newEndJobIds,
            };
          }

          // Update the source column
          board.columns[source.droppableId] = {
            ...sourceColumn,
            jobIds: newStartJobIds,
          };

          // Set the new board state
          setBoard({
            ...board,
            columns: board.columns
          });
          console.log(            sourceColumn.id,
            destinationColumn.id,
            draggableId,
            destination.index,
            )
          // Execute the API request to move the job
          await moveJob(
            sourceColumn.id,
            destinationColumn.id,
            draggableId,
            destination.index,
            token
          );
        }
      } catch (error) {
        console.error(error);
      }
    },
    [getIdToken, board] 
  );

  const renderSkeleton = (
    <Stack direction="row" alignItems="flex-start" spacing={3}>
      {[...Array(4)].map((_, index) => (
        <KanbanColumnSkeleton key={index} index={index} />
      ))}
    </Stack>
  );

  return (
    <Container
      sx={{
        height: 1,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        Board
      </Typography>

      {boardLoading && renderSkeleton}

      {board && board?.ordered?.length === 0 && (
        <></>
      )}

      {!!board?.ordered?.length && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="COLUMN" direction="horizontal">
            {(provided) => (
              <Stack
                ref={provided.innerRef}
                {...provided.droppableProps}
                spacing={3}
                direction="row"
                alignItems="flex-start"
                sx={{
                  p: 0.25,
                  height: 1,
                  overflowY: 'hidden',
                  ...hideScroll.x,
                }}
              >
              {
              // Ensure that 'board' exists and has jobs before rendering
              board && Object.keys(board.jobs)?.length > 0 && board?.ordered.map((columnId, index) => {

                  // Fetch the specific column object based on 'columnId'
                  const column = board?.columns[columnId];

                  // Fetch the jobIds for the specific column and find the corresponding jobs
                  const columnJobs = column && column.jobIds && board.jobs
                    ? column.jobIds.map(jobId => board.jobs[jobId])
                    : [];

                  // Render the KanbanColumn component
                  return (
                    <KanbanColumn
                      index={index}
                      key={columnId}
                      openPopUp={openPopUp}
                      setOpenPopUp={setOpenPopUp}
                      column={column}
                      jobs={columnJobs}
                      setJob={setJob}
                      members={board?.members ? board.members : {}}
                      onJobAdd={onJobAdd}
                    />
                  );
                })
              }

                {provided.placeholder}
              </Stack>
            )}
          </Droppable>
        </DragDropContext>
      )}
      <PopOver
        job={job}
        openPopOver={openPopUp}
        onClosePopOver={() => setOpenPopUp(false)}
      />
    </Container>
  );
}
