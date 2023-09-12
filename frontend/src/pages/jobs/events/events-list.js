import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import { useMediaQuery, useTheme } from '@mui/material';
import MessageStep from './message-step';
import CrudStep from './crud-step';

export default function EventsList({ events, members }) {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('sm'));
  const isLaptop = useMediaQuery(theme.breakpoints.up('md'));
  const isMobile = useMediaQuery('(max-width: 599px)'); // Check for screens with a width less than or equal to 599px
  const isSmallMobile = useMediaQuery('(max-width: 375px)'); // Check for screens with a width less than or equal to 375px
  const isTinyMobile = useMediaQuery('(max-width: 412px)'); // Check for screens with a width less than or equal to 412px

  useEffect(() => {
    // Your useEffect logic here
  }, [events]);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    margin: '0',
    padding: '0',
  };

  const messageBoxContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  };

  const verticalLineStyle = {
    width: '1px',
    backgroundColor: 'lightgrey',
    marginRight: isMobile
      ? '26.2em'
      : isTablet && !isMobile
      ? '20px'
      : isSmallMobile
      ? '0' // Set the margin to 0 when screen width is <= 375px
      : isTinyMobile
      ? '0' // Set the margin to 0 when screen width is <= 412px
      : '75%',
    border: '1px solid #E5E4E2',
    height: '100%',
    position: 'absolute',
    right: '0',
    top: '0',
    zIndex: '-1',
  };

  const eventsHeadingStyle = {
    textAlign: 'center',
    margin: '0 0 0 10px',
    padding: '0',
    [theme.breakpoints.down('sm')]: {
      marginLeft: '30px', // Move the margin left to 30px on screens <= 599px
    },
    [theme.breakpoints.up('md')]: {
      marginRight: '14em',
    },
  };

  const avatarLeftStyle = {
    marginLeft: isTinyMobile || isSmallMobile ? '0' : '30px', // Move the icon avatar 30px to the left or 0px when screen width is <= 412px or 375px
  };

  const RenderEvent = ({ event, index }) => {
    const member = members && event && event.memberId && members[event.memberId];
    return member && (
      <React.Fragment key={event.id}>
        <div style={messageBoxContainerStyle}>
          {index !== 0 && <div style={verticalLineStyle} />}
          <div
            key={event.id}
            elevation={3}
            style={isMobile ? avatarLeftStyle : {}}
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
    <div style={containerStyle}>
      <h2 style={eventsHeadingStyle}>Events</h2>
      {events &&
        events.map((event, index) => (
          <RenderEvent key={index} event={event} index={index} />
        ))}
    </div>
  );
}
