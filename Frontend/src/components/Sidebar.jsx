import React from 'react';
import { Box, Typography, IconButton, Tooltip, Avatar, Badge } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LogoutIcon from '@mui/icons-material/Logout';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SupportIcon from '@mui/icons-material/Support';
import { Button, Divider } from '@mui/material';
import NotificationList from './NotificationList.jsx';
import { getNotifications } from '../api/notifications';

export default function Sidebar({ displayName, username }) {
  const [expanded, setExpanded] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = React.useState(null);
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'candidate';

  const handleLogout = () => {
    try {
      localStorage.removeItem('username');
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
    } catch (e) {}
    navigate('/');
  };

  const width = expanded ? 240 : 72;
  const isActive = (path) => location.pathname.startsWith(path);

  const NavItem = ({ to, icon, label }) => {
    const active = isActive(to);
    if (expanded) {
      return (
        <Button
          component={RouterLink}
          to={to}
          startIcon={icon}
          color={active ? 'primary' : 'inherit'}
          sx={{ justifyContent: 'flex-start', width: '100%', borderRadius: 2, textTransform: 'none' }}
        >
          {label}
        </Button>
      );
    }
    return (
      <Tooltip title={label} placement="right">
        <IconButton component={RouterLink} to={to} size="large" color={active ? 'primary' : 'default'}>
          {icon}
        </IconButton>
      </Tooltip>
    );
  };

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      if (data && data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  // Fetch notifications on component mount
  React.useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationsClick = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
    setNotificationsOpen((prev) => {
      const newState = !prev;
      if (newState) {
        fetchNotifications();
      }
      return newState;
    });
  };

  const handleNotificationsClose = () => {
    setNotificationsOpen(false);
    setNotificationsAnchorEl(null);
  };

  const handleNotificationRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  const handleAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <Box
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      sx={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width,
        transition: 'width 200ms ease',
        bgcolor: 'background.paper',
        '&:hover': { bgcolor: 'transparent' },
        borderRight: (theme) => `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: expanded ? 'flex-start' : 'center',
        gap: 1,
        p: 1.5,
        boxShadow: 3,
        zIndex: 1200

      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', mb: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>{(displayName || username || 'U').charAt(0).toUpperCase()}</Avatar>
        {expanded && (
          <Typography variant="subtitle1" noWrap>{displayName || username || 'User'}</Typography>
        )}
      </Box>

      {/* Role-based navigation */}
      {userRole === 'candidate' ? (
        <>
          <NavItem to="/app/jobs" icon={<WorkOutlineIcon />} label="Jobs" />
          <NavItem to="/app/profile" icon={<AccountCircleIcon />} label="Profile" />
        </>
      ) : (
        <>
          <NavItem to="/app/jobs/new" icon={<WorkOutlineIcon />} label="Post Job" />
          <NavItem to="/app/admin/profiles" icon={<AccountCircleIcon />} label="Admin" />
          <NavItem to="/app/admin/support" icon={<SupportIcon />} label="Support" />
        </>
      )}

      {/* Notifications for all users */}
      {expanded ? (
        <Button
          startIcon={
            <Badge badgeContent={unreadCount} color="primary">
              <NotificationsNoneIcon />
            </Badge>
          }
          sx={{ justifyContent: 'flex-start', width: '100%', borderRadius: 2, textTransform: 'none' }}
          onClick={handleNotificationsClick}
        >
          Notifications
        </Button>
      ) : (
        <Tooltip title="Notifications" placement="right">
          <IconButton size="large" onClick={handleNotificationsClick}>
            <Badge badgeContent={unreadCount} color="primary">
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      )}

      <NotificationList
        open={notificationsOpen}
        anchorEl={notificationsAnchorEl}
        onClose={handleNotificationsClose}
        notifications={notifications}
        unreadCount={unreadCount}
        onNotificationRead={handleNotificationRead}
        onAllRead={handleAllRead}
      />

      <Box sx={{ flexGrow: 1 }} />

      <Tooltip title="Logout" placement="right">
        <IconButton color="error" onClick={handleLogout} size="large">
          <LogoutIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}


