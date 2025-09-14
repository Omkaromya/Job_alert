import React from 'react';
import {
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Box,
  Badge,
  Divider,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../api/notifications';

export default function NotificationList({
  open,
  anchorEl,
  onClose,
  notifications = [],
  unreadCount = 0,
  onNotificationRead,
  onAllRead
}) {
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      if (onNotificationRead) {
        onNotificationRead(notificationId);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      if (onAllRead) {
        onAllRead();
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: { width: 400, maxHeight: 500 }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">
          Notifications
          {unreadCount > 0 && (
            <Badge
              badgeContent={unreadCount}
              color="primary"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        <Box>
          {unreadCount > 0 && (
            <IconButton
              size="small"
              onClick={handleMarkAllAsRead}
              title="Mark all as read"
            >
              <DoneAllIcon />
            </IconButton>
          )}
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Divider />

      {notifications.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No notifications
          </Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                  cursor: !notification.is_read ? 'pointer' : 'default',
                  '&:hover': {
                    bgcolor: !notification.is_read ? 'action.selected' : 'transparent'
                  }
                }}
                onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body1" sx={{ fontWeight: notification.is_read ? 'normal' : 'bold', flex: 1 }}>
                        {notification.title || 'New Notification'}
                      </Typography>
                      {!notification.is_read && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          title="Mark as read"
                          sx={{ ml: 1, color: 'primary.main' }}
                        >
                          <DoneIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(notification.created_at)}
                      </Typography>
                    </Box>
                  }
                />
                {!notification.is_read && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      bgcolor: 'primary.main',
                      borderRadius: '50%',
                      ml: 1
                    }}
                  />
                )}
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      {notifications.length > 0 && (
        <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            size="small"
            onClick={onClose}
          >
            Close
          </Button>
        </Box>
      )}
    </Popover>
  );
}
