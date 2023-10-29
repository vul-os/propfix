import React, { useEffect } from 'react';
import { camelKeys } from 'js-convert-case';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import { useMediaQuery, useTheme } from '@mui/material';
import MessageStep from './message-step';
import CrudStep from './crud-step';

export default function EventsList({ events, members, attachments }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.only('md'));

  useEffect(() => {
    console.log("attcheys: ", attachments, events)
    // Your useEffect logic here
  }, [events, attachments]);

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
    border: '1px solid #E5E4E2',
    height: '100%',
    position: 'absolute',
    marginLeft: isSmallScreen ? '30%' : isMediumScreen ? '35%' : '25%', // Set margin based on screen size
    top: '0',
    zIndex: '-1',
  };

  const eventsHeadingStyle = {
    textAlign: 'center',
    margin: '0 0 0 10px',
    padding: '0',

  };

  const RenderEvent = ({ eventRaw, index, files}) => {
    const event = camelKeys(eventRaw)
    const member = members && event && event.memberId && members[event.memberId];
    return member && files && (
      <React.Fragment key={event.id}>
        <div style={messageBoxContainerStyle}>
          {index !== 0 && <div style={verticalLineStyle} />}
          <div
            key={event.id}
            elevation={3}
            style={{width: "100%"}}
          >
            {event.type === 'MESSAGE' ? (
              <MessageStep eventRaw={event} member={member} attachments={files} />
            ) : (
              <CrudStep eventRaw={event} member={member} />
            )}
          </div>
        </div>
      </React.Fragment>
    );
  };

  return (
    <div style={containerStyle}>
      <h2 style={eventsHeadingStyle}>Events</h2>
      {events && attachments &&
        events.map((event, index) => (
          <RenderEvent key={index} eventRaw={event} index={index} files={attachments} />
        ))}
    </div>
  );
}
