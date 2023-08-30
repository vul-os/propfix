import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom'; // Import the useParams hook
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { fToNow } from '../../utils/format-time';
import { useAuthContext } from '../../contexts/auth';
import { getAllEvents } from '../../api/events'; // Import your getAllEvents function

// You can customize the styles in this component
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
  },
  event: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '16px',
  },
  avatar: {
    width: '40px',
    height: '40px',
  },
  comment: {
    borderLeft: '4px solid',
    paddingLeft: '12px',
  },
  publicComment: {
    borderColor: 'green', // Change the color for public comments
  },
  privateComment: {
    borderColor: 'red', // Change the color for private comments
  },
};

export default function EventsList() {
    const { jobId } = useParams(); // Get the jobId from URL params
    const { getIdToken } = useAuthContext();

    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchEvents();
    }, [jobId]); // Fetch events whenever jobId changes

    const fetchEvents = async () => {
        try {
        const idToken = await getIdToken();
        const allEvents = await getAllEvents(jobId, idToken); // Use getAllEvents with jobId
        setEvents(allEvents.events);
        } catch (error) {
        console.error('Error fetching events:', error);
        }
    };
  return (
    <div style={styles.container}>
      {events.map((event) => (
        <Paper key={event.id} elevation={3}>
          <div style={styles.event}>
            <Avatar src="dummy-avatar-url" style={styles.avatar} />

            <div>
              <Typography variant="subtitle2">{event.type === 'CRUD' ? 'CRUD Step' : 'Comment Step'}</Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {fToNow(event.createdAt)}
              </Typography>
            </div>
          </div>

          {event.type === 'CRUD' && (
            <div style={styles.comment}>
              <Typography variant="body2">
                {event.data.messageType} Event
              </Typography>
            </div>
          )}

          {event.type === 'MESSAGE' && (
            <div style={{ ...styles.comment, ...(event.data.visibility === 'public' ? styles.publicComment : styles.privateComment) }}>
              <Typography variant="body2">
                {event.data.message}
              </Typography>
            </div>
          )}
        </Paper>
      ))}
    </div>
  );
}

EventsList.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['CRUD', 'MESSAGE']).isRequired,
      createdAt: PropTypes.string.isRequired,
      data: PropTypes.shape({
        messageType: PropTypes.oneOf(['create', 'update', 'delete']),
        visibility: PropTypes.oneOf(['public', 'private']),
        message: PropTypes.string,
      }),
    })
  ),
};
