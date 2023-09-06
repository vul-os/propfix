import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import { useMediaQuery, useTheme, makeStyles } from '@mui/material';
import { useAuthContext } from '../../../contexts/auth';
import { useBoardContext } from '../../../contexts/board';
import { getAllEvents } from '../../../api/events';
import MessageStep from './message-step';
import CrudStep from './crud-step';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0',
    padding: '0',
  },
  messageBoxContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  verticalLine: {
    width: '1px',
    backgroundColor: 'lightgrey',
    marginRight: '75%',
    border: '1px solid #E5E4E2',
    height: '100%',
    position: 'absolute',
    right: '0',
    top: '0',
    zIndex: '-1',
  },
  eventsHeading: {
    textAlign: 'center',
    margin: '0 0 0 10px',
    padding: '0',
    [theme.breakpoints.down('sm')]: {
      marginLeft: '30px', // Move the margin left to 30px on screens less than or equal to 599px
    },
    [theme.breakpoints.up('md')]: {
      marginRight: '14em',
    },
  },
  'avatar-left': {
    marginLeft: '30px', // Move the icon avatar 30px to the left
  },
}));

export default function EventsList({ jobId }) {
  const { board } = useBoardContext();
  const { getIdToken } = useAuthContext();
  const [events, setEvents] = useState([]);
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('sm'));
  const isLaptop = useMediaQuery(theme.breakpoints.up('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isMobile = useMediaQuery('(max-width: 559px)'); // Check for screens with a width less than or equal to 559px
  const classes = useStyles();

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

  const RenderEvent = ({ event, index }) => {
    const member = board && board.members && event && event.memberId && board.members[event.memberId];
    return member && (
      <React.Fragment key={event.id}>
        <div style={EventsList.messageBoxContainer}>
          {index !== 0 && <div style={EventsList.verticalLine} />}
          <div
            key={event.id}
            elevation={3}
            className={isMobile ? classes['avatar-left'] : ''}
          >
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
    <div style={EventsList.container}>
      <h2 style={classes.eventsHeading}>Events</h2>
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
