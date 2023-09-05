import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import { useAuthContext } from '../../../contexts/auth';
import { useBoardContext } from '../../../contexts/board'; 
import { getAllEvents } from '../../../api/events';
import MessageStep from './message-step'; // Import the MessageStep component
import CrudStep from './crud-step'; // Import the CrudStep component

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0', // Remove margin
    padding: '0', // Remove padding
  },
  // Add a vertical line style
  messageBoxContainer: {
    display: 'flex', // Use flex to align content horizontally
    alignItems: 'center', // Vertically center the content
    position: 'relative', // Position relative to place the line
  },
  // vertical line style
  verticalLine: {
    width: '1px',
    backgroundColor: 'lightgrey', // Updated background color to lighter grey
    marginRight: '75%', // Set marginRight to 0 to join the lines
    border: '1px solid #E5E4E2', // Add the border
    height: '100%', // Extend the line to cover the full height
    position: 'absolute', // Position the line absolutely
    right: '0', // Position the line to the right
    top: '0', // Position the line at the top
    zIndex: '-1', // Set the z-index to -1
  },
  eventsHeading: {
    textAlign: 'center', // Center the text
    margin: '0 0 0 10px', // Set margin-left to 10px
    padding: '0', // Remove padding
    marginRight: '14em',
  },
};

export default function EventsList({ jobId }) {
  const { board } = useBoardContext(); // Use the BoardProvider context
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

  const RenderEvent = ({event, index}) => {
    const member = board && board.members && event && event.memberId && board.members[event.memberId];
    return member && (
      <React.Fragment key={event.id}>
        <div style={styles.messageBoxContainer}>
          {index !== 0 && <div style={styles.verticalLine}/> }
          <div key={event.id} elevation={3}>
            {event.type === 'MESSAGE' ? (
              <MessageStep event={event} member={member} />
            ) : (
              <CrudStep event={event} member={member} />
            )}
          </div>
        </div>
      </React.Fragment>
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.eventsHeading}>Events</h2> {/* Centered "Events" heading */}
      {events &&
        events.map((event, index) => (
          <RenderEvent event={event} index={index} />
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
