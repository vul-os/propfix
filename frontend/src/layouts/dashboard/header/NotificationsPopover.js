import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Popover from '@mui/material/Popover';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import moment from 'moment';
import { getAllNotifications } from '../../../api/notifications';
import { useAuthContext } from '../../../contexts/auth';

const NotificationsComponent = () => {
  const { getIdToken, userId } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const fetchedNotifications = await getAllNotifications();
        console.log('Fetched Notifications:', fetchedNotifications);
        setNotifications(fetchedNotifications);

        const unreadNotifications = fetchedNotifications.filter(
          (notification) => notification.status === 'unread'
        );
        console.log('Unread Notifications:', unreadNotifications);
        setUnreadCount(unreadNotifications.length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const formatTimeAgo = (timestamp) => {
    const now = moment();
    const createdAt = moment(timestamp);
    const duration = moment.duration(now.diff(createdAt));

    if (duration.asSeconds() < 60) {
      return 'Just now';
    }

    if (duration.asMinutes() < 60) {
      return `${Math.floor(duration.asMinutes())} minute${Math.floor(
        duration.asMinutes()
      ) > 1 ? 's' : ''} ago`;
    }

    if (duration.asHours() < 24) {
      return `${Math.floor(duration.asHours())} hour${Math.floor(
        duration.asHours()
      ) > 1 ? 's' : ''} ago`;
    }

    return createdAt.fromNow();
  };

  return (
    <div className="notifications-container">
      <IconButton className="custom-bell-icon" onClick={handleClick}>
        <Badge
          badgeContent={unreadCount > 0 ? unreadCount : null}
          color="error"
          className="custom-badge"
        >
          <NotificationsIcon className="custom-notifications-icon" />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        style={{ width: '200%', maxWidth: '10000%', padding: '40px' }}
      >
        <Typography variant="h6" style={{ padding: '10px' }}>
          Notifications
        </Typography>

        <List>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <ListItem
                key={notification.id}
                className={`custom-list-item ${
                  notification.status === 'unread' ? 'unread-notification' : ''
                }`}
                style={{
                  border: '1px solid #ddd', // Adjust the color as needed
                  borderRadius: '8px', // Adjust the radius as needed
                  margin: '8px 0', // Add some margin for separation
                  padding: '8px', // Add padding for content spacing
                  transition: 'background-color 0.3s', // Add smooth transition
                }}
                onMouseEnter={(e) => {
                  // Change background color on hover
                  if (notification.status === 'unread') {
                    // Use a different color for unread notifications on hover
                    e.currentTarget.style.backgroundColor = '#e0f7fa'; // Adjust the color as needed
                  } else {
                    e.currentTarget.style.backgroundColor = '#f5f5f5'; // Adjust the color as needed
                  }
                }}
                onMouseLeave={(e) => {
                  // Reset background color on leave
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <ListItemAvatar>
                  <Avatar alt="User Avatar" src={notification.userAvatar} />
                </ListItemAvatar>
                <Typography variant="body1">
                  <strong>{notification.title}</strong>
                  <br />
                  {notification.message}
                  <br />
                  <small>{formatTimeAgo(notification.created_at)}</small>
                </Typography>
              </ListItem>
            ))
          ) : (
            <Typography className="custom-no-notifications">
              No notifications to display.
            </Typography>
          )}
        </List>
      </Popover>
    </div>
  );
};

export default NotificationsComponent;
