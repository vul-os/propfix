import { useCallback } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
// @mui
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';


// components
import EmptyContent from '../../../components/empty-content';
// api
import { useGetBoard, moveColumn, moveTask } from '../../../api/kanban';
// theme
import { hideScroll } from '../../../theme/css';
//
import KanbanColumn from '../kanban-column';
import { KanbanColumnSkeleton } from '../kanban-skeleton';

// ----------------------------------------------------------------------

export default function KanbanView() {
  const { board, boardLoading, boardEmpty } = useGetBoard();

  const onDragEnd = useCallback(
    async ({ destination, source, draggableId, type }) => {
      try {
        if (!destination) {
          return;
        }

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
          return;
        }

        // Moving column
        if (type === 'COLUMN') {
          const newOrdered = [...board.ordered];

          newOrdered.splice(source.index, 1);

          newOrdered.splice(destination.index, 0, draggableId);

          moveColumn(newOrdered);
          return;
        }

        const sourceColumn = board?.columns[source.droppableId];

        const destinationColumn = board?.columns[destination.droppableId];

        // Moving task to same list
        if (sourceColumn.id === destinationColumn.id) {
          const newjobids = [...sourceColumn.jobids];

          newjobids.splice(source.index, 1);

          newjobids.splice(destination.index, 0, draggableId);

          moveTask({
            ...board?.columns,
            [sourceColumn.id]: {
              ...sourceColumn,
              jobids: newjobids,
            },
          });

          console.info('Moving to same list!');

          return;
        }

        // Moving task to different list
        const sourcejobids = [...sourceColumn.jobids];

        const destinationjobids = [...destinationColumn.jobids];

        // Remove from source
        sourcejobids.splice(source.index, 1);

        // Insert into destination
        destinationjobids.splice(destination.index, 0, draggableId);

        moveTask({
          ...board?.columns,
          [sourceColumn.id]: {
            ...sourceColumn,
            jobids: sourcejobids,
          },
          [destinationColumn.id]: {
            ...destinationColumn,
            jobids: destinationjobids,
          },
        });

        console.info('Moving to different list!');
      } catch (error) {
        console.error(error);
      }
    },
    [board?.columns, board?.ordered]
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

      {boardEmpty && (
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
                {board?.ordered.map((columnId, index) => (
                  <KanbanColumn
                    index={index}
                    key={columnId}
                    column={board?.columns[columnId]}
                    jobs={board?.jobs}
                  />
                ))}

                {provided.placeholder}
              </Stack>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Container>
  );
}
