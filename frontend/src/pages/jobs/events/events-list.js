import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import { useAuthContext } from '../../../contexts/auth';
import { getAllEvents } from '../../../api/events';
import MessageStep from './message-step'; // Import the MessageStep component
import CrudStep from './crud-step'; // Import the CrudStep component

export default function EventsList({ jobId }) {
  // const { jobId } = useParams();
  const { getIdToken } = useAuthContext();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (jobId) {
      fetchEvents();
    }
  }, [jobId]);

  const fetchEvents = async () => {
    try {
      const idToken = await getIdToken();
      const allEvents = await getAllEvents(jobId, idToken);
      setEvents(allEvents.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  return (
    <Stack
      flexGrow={1}
      sx={{
        bgcolor: 'white', // Set the background color to white
      }}
    >
      {events && events.map((event) => (
        <div key={event.id} elevation={3}>
          {event.type === 'MESSAGE' ? (
            <MessageStep event={event} />
          ) : (
            <CrudStep event={event} />
          )}
        </div>
      ))}
    </Stack>
  );
}

EventsList.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['MESSAGE']).isRequired,
      createdAt: PropTypes.string.isRequired,
      data: PropTypes.shape({
        visibility: PropTypes.oneOf(['public', 'private']),
        message: PropTypes.string,
        messageType: PropTypes.oneOf(['create', 'update', 'delete']),
      }),
    })
  ),
};
