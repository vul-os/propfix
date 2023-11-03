import React, { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Popover from '@mui/material/Popover';
import { createNotification, getAllNotifications } from '../../../api/notifications';

const NotificationsComponent = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const fetchedNotifications = await getAllNotifications(userId);
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter(notification => notification.status === 'unread').length);
    };

    fetchNotifications();
  }, [userId]); // Fetch notifications when userId changes

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const formatTimeAgo = (timestamp) => {
    const createdAt = new Date(timestamp);
    const now = new Date();

    const timeDifference = now - createdAt;
    const hoursAgo = Math.floor(timeDifference / (1000 * 60 * 60));

    return `${hoursAgo} ${hoursAgo === 1 ? 'hour' : 'hours'} ago`;
  };

  return (
    <div className="notifications-container">
      <IconButton className="bell-icon" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
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
      >
        {notifications.length > 0 ? (
          <ul className="notification-list">
            {notifications.map(notification => (
              <li key={notification.id} className="notification-item">
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
                <small>{formatTimeAgo(notification.created_at)}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No notifications to display.</p>
        )}
      </Popover>
    </div>
  );
};

export default NotificationsComponent;
