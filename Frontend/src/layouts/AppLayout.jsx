import React from 'react';
import { Box, Container } from '@mui/material';
import Sidebar from '../components/Sidebar.jsx';

function formatNameFromEmail(email) {
  if (!email) return '';
  const base = email.split('@')[0] || '';
  const spaced = base.replace(/[._-]+/g, ' ');
  return spaced
    .split(' ')
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

export default function AppLayout({ children }) {
  const [username, setUsername] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');

  const loadNames = React.useCallback(() => {
    try {
      const user = localStorage.getItem('username') || '';
      const full = (localStorage.getItem('full_name') || '').trim();
      setUsername(user);
      
      // Prioritize full_name, then formatted username, then fallback
      if (full) {
        setDisplayName(full);
      } else if (user && user.includes('@')) {
        setDisplayName(formatNameFromEmail(user));
      } else if (user) {
        setDisplayName(user);
      } else {
        setDisplayName('User');
      }
    } catch (e) {
      setUsername('');
      setDisplayName('User');
    }
  }, []);

  React.useEffect(() => {
    loadNames();
    
    // Listen for storage changes (when user logs in)
    const onStorage = () => loadNames();
    window.addEventListener('storage', onStorage);
    
    // Also listen for custom events (for same-tab updates)
    const onCustomStorage = () => loadNames();
    window.addEventListener('localStorageChange', onCustomStorage);
    
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('localStorageChange', onCustomStorage);
    };
  }, [loadNames]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar displayName={displayName} username={username} />
      <Container maxWidth="lg" sx={{ ml: { xs: 9, sm: 10 }, pt: 3 }}>
        {children}
      </Container>
    </Box>
  );
}


