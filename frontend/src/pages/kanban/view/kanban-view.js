import { useCallback, useEffect, useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import EmptyContent from '../../../components/empty-content';
import { moveJob } from '../../../api/columns';
import { getBoard } from '../../../api/jobs';
import { hideScroll } from '../../../theme/css';

import KanbanColumn from '../kanban-column';
import { KanbanColumnSkeleton } from '../kanban-skeleton';
import { useAuthContext } from '../../../contexts/auth'; 

export default function KanbanView() {
  const [board, setBoard] = useState(null);
  const [boardLoading, setBoardLoading] = useState(true);
  const { getIdToken } = useAuthContext(); 
  useEffect(() => {
    async function fetchData() {
      try {
        const token = await getIdToken(); 
        const boardData = await getBoard(token, "8d3a2d83-ba07-48e9-a2db-af91247b3183");
        setBoard(boardData.board);
        setBoardLoading(false);
      } catch (error) {
        console.error('Error fetching board:', error);
        setBoard(null);
        setBoardLoading(false);
      }
    }

    fetchData();
  }, [getIdToken]);

  const onDragEnd = useCallback(
    async ({ destination, source, draggableId, type }) => {
      const token = await getIdToken(); 
      try {
        if (!destination) {
          return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
          return;
        }

        const sourceColumn = board?.columns[source.droppableId];
        const destinationColumn = board?.columns[destination.droppableId];

        if (sourceColumn && destinationColumn) {
          // Get a copy of job ids from source column
          const newStartJobIds = Array.from(sourceColumn.jobids || []);
  
          // Remove the job id from source column
          newStartJobIds.splice(source.index, 1);
  
          // Get a copy of job ids from destination column
          const newEndJobIds = Array.from(destinationColumn.jobids || []);
  
          // Add the job id to the destination column
          newEndJobIds.splice(destination.index, 0, draggableId);
  
          // Create new board state
          const newBoardState = {
            ...board,
            columns: {
              ...board.columns,
              [source.droppableId]: {
                ...sourceColumn,
                jobids: newStartJobIds,
              },
              [destination.droppableId]: {
                ...destinationColumn,
                jobids: newEndJobIds,
              },
            },
          };
  
          setBoard(newBoardState);
        }
  

        // actually do api request
        await moveJob(
          sourceColumn.jobids[source.index],
          sourceColumn.id,
          destinationColumn.id,
          token 
        );

        console.info('Moving to a different list!');
      } catch (error) {
        console.error(error);
      }
    },
    [getIdToken] 
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

      {board?.ordered.length === 0 && (
        <EmptyContent
          filled
          title="No Data"
          sx={{
            py: 10,
            maxHeight: { md: 480 },
          }}
        />
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
                    column={column}
                    jobs={columnJobs}
                  />
                })}
                {provided.placeholder}
              </Stack>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Container>
  );
}
