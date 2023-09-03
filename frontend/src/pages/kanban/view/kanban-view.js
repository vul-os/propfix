import { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import EmptyContent from '../../../components/empty-content';
import { moveJobs } from '../../../api/columns';
import { getBoard } from '../../../api/jobs';
import { hideScroll } from '../../../theme/css';

import KanbanColumn from '../kanban-column';
import { KanbanColumnSkeleton } from '../kanban-skeleton';
import { useAuthContext } from '../../../contexts/auth'; 
import { useBoardContext } from '../../../contexts/board'; 
import PopOver from '../../jobs/pop-over';

export default function KanbanView() {
  const { board, setBoard, boardLoading } = useBoardContext(); // Use the BoardProvider context
  const { getIdToken } = useAuthContext(); 
  const [openPopUp, setOpenPopUp] = useState(false);
  const [job, setJob] = useState({});
  console.log("original board: ", board)
  const onDragEnd = useCallback(
    async ({ destination, source, draggableId, type }) => {
      const token = await getIdToken(); 
      console.log(destination, source, draggableId)
      try {
        if (!destination) {
          return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
          return;
        }

        const sourceColumn = board?.columns[source.droppableId];
        const destinationColumn = board?.columns[destination.droppableId];

        if (sourceColumn && destinationColumn && sourceColumn.id !== destinationColumn.id) {
          console.log("heree: ", sourceColumn, destinationColumn)
          // Get a copy of job ids from source column
          const newStartJobIds = Array.from(sourceColumn.jobIds || []);
  
          // Remove the job id from source column
          newStartJobIds.splice(source.index, 1);
  
          // Get a copy of job ids from destination column
          const newEndJobIds = Array.from(destinationColumn.jobIds || []);
  
          // Add the job id to the destination column
          newEndJobIds.splice(destination.index, 0, draggableId);
          console.log("heree: ", newStartJobIds, newEndJobIds)

          // Create new board state
          const newBoardState = {
            ...board,
            columns: {
              ...board.columns,
              [source.droppableId]: {
                ...sourceColumn,
                jobIds: newStartJobIds,
              },
              [destination.droppableId]: {
                ...destinationColumn,
                jobIds: newEndJobIds,
              },
            },
          };
          setBoard(newBoardState);
          // actually do api request
          await moveJobs(
            sourceColumn.id,
            destinationColumn.id,
            [draggableId],
            token 
          );
        }
   
        
        console.info('Moving to a different list!');
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
      maxWidth={false}
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
        Kanban
      </Typography>

      {boardLoading && renderSkeleton}

      {board && board?.ordered.length === 0 && (
        <></>
      )}

      {!!board?.ordered.length && (
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
                {board && Object.keys(board.jobs).length > 0 && board?.ordered.map((columnId, index) => {
                  const column = board?.columns[columnId];
                  const columnJobs = column && column.jobIds && board.jobs
                  ? column.jobIds.map(jobId => board.jobs[jobId])
                  : [];
                  return <KanbanColumn
                    index={index}
                    key={columnId}
                    openPopUp={openPopUp}
                    setOpenPopUp={setOpenPopUp}
                    column={column}
                    jobs={columnJobs}
                    setJob={setJob}
                  />
                })}
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
