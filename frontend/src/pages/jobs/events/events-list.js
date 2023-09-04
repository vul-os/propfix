import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import { useAuthContext } from '../../../contexts/auth';
import { getAllEvents } from '../../../api/events';
import MessageStep from './message-step'; // Import the MessageStep component
import CrudStep from './crud-step'; // Import the CrudStep component

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    // gap: '16px',
    padding: '16px',
  },
  // Add a vertical line style
  messageBoxContainer: {
    display: 'flex', // Use flex to align content horizontally
    alignItems: 'center', // Vertically center the content
    position: 'relative', // Position relative to place the line
  },
  // vertical line style
  duplicatedVerticalLine: {
    width: '1px',
    backgroundColor: 'grey',
    marginRight: '80%', // Set marginRight to 0 to join the lines
    border: '1px solid lightgrey', // Add the border
    height: '100%', // Extend the line to cover the full height
    position: 'absolute', // Position the line absolutely
    right: '0', // Position the line to the right
    top: '0', // Position the line at the top
    zIndex: '-1', // Set the z-index to -1
  },
};

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
    <div style={styles.container}>
      {events &&
        events.map((event, index) => (
          <React.Fragment key={event.id}>
            <div style={styles.messageBoxContainer}>
             
              <div key={event.id} elevation={3}>
                {event.type === 'MESSAGE' ? (
                  <MessageStep event={event} />
                ) : (
                  <CrudStep event={event} />
                )}
              </div>
              {<div style={styles.duplicatedVerticalLine}/> /* Duplicated vertical line */}
            </div>
          </React.Fragment>
        ))}
    </div>
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
