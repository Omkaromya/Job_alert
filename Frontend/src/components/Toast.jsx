import React from 'react';
import { Snackbar, Alert } from '@mui/material';

export default function Toast({ open, onClose, severity = 'info', message, autoHideDuration = 4000 }) {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      autoHideDuration={autoHideDuration}
    >
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}


