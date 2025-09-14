import './App.css';
import React from 'react';
import { Routes, Route, Link as RouterLink, useNavigate, Navigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockIcon from '@mui/icons-material/Lock';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PhoneIcon from '@mui/icons-material/Phone';
import { IconButton } from '@mui/material';
import { registerUser, verifyEmail, resendOtp, loginUser, getMyRole, getCurrentUser, checkUserRole, getUserProfile, forgotPassword, resetPassword } from './api/auth';
import { AUTH_ENDPOINTS } from './config';
import Toast from './components/Toast.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import Profile from './pages/Profile.jsx';
import Jobs from './pages/Jobs.jsx';
import AddJob from './pages/AddJob.jsx';
import ProfilesList from './pages/admin/ProfilesList.jsx';
import ProfileDetail from './pages/admin/ProfileDetail.jsx';
import Support from './pages/admin/Support.jsx';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = [] }) {
  const userRole = localStorage.getItem('userRole');
  const username = localStorage.getItem('username');
  
  if (!username) {
    return <Navigate to="/" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/app/jobs" replace />;
  }
  
  return children;
}

function LoginPage() {
  const [role, setRole] = React.useState('candidate');
  const [showLoginPassword, setShowLoginPassword] = React.useState(false);
  const [toast, setToast] = React.useState({ open: false, severity: 'info', message: '' });
  const [emailAuthOpen, setEmailAuthOpen] = React.useState(false);
  const [emailAuthEmail, setEmailAuthEmail] = React.useState('');
  const [emailAuthOtp, setEmailAuthOtp] = React.useState('');
  const [emailAuthStep, setEmailAuthStep] = React.useState('email'); // 'email' or 'otp'
  const [sendingOtp, setSendingOtp] = React.useState(false);
  const [verifyingOtp, setVerifyingOtp] = React.useState(false);
  
  // Forgot Password states
  const [forgotPasswordOpen, setForgotPasswordOpen] = React.useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = React.useState('email');
  const [forgotPasswordEmail, setForgotPasswordEmail] = React.useState('');
  const [forgotPasswordOtp, setForgotPasswordOtp] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [sendingForgotOtp, setSendingForgotOtp] = React.useState(false);
  const [verifyingForgotOtp, setVerifyingForgotOtp] = React.useState(false);
  const [resettingPassword, setResettingPassword] = React.useState(false);
  
  const showToast = (severity, message) => setToast({ open: true, severity, message });
  const closeToast = () => setToast({ ...toast, open: false });

  // Role mapping functions
  const mapUiRoleToApi = (role) => (role === 'candidate' ? 'user' : role);
  const mapApiRoleToUi = (role) => (role === 'user' ? 'candidate' : role);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const emailOrMobile = data.get('email');
    const password = data.get('password');
    
    // Determine if it's email or mobile number
    const isEmail = emailOrMobile.includes('@');
    const username = isEmail ? emailOrMobile : emailOrMobile;
    
    try {
      const res = await loginUser({ username, password });
      
      // Store token first
      if (res?.access_token) {
        localStorage.setItem('token', res.access_token);
        localStorage.setItem('username', username);
      }
      
      // Verify user role and get profile data from backend
      try {
        let userData;
        try {
          // Try /me endpoint first since we know it works
          userData = await getCurrentUser();
        } catch (meErr) {
          // If /me fails, try profile endpoint
          console.log('/me endpoint failed, trying profile endpoint:', meErr);
          try {
            userData = await getUserProfile();
          } catch (profileErr) {
            // If profile fails, fall back to role endpoint
            console.log('Profile endpoint failed, using role endpoint:', profileErr);
            userData = await getMyRole();
          }
        }
        
        const backendRole = userData.role;
        
        // Handle case where role is undefined
        if (!backendRole) {
          showToast('error', 'Unable to determine user role. Please try again.');
          console.error('Backend role is undefined. Full response:', userData);
          return;
        }
        
        const mappedBackendRole = mapApiRoleToUi(backendRole);
        
        // Check if selected role matches backend role (with proper mapping)
        if (mappedBackendRole !== role) {
          showToast('error', `Access denied. Your account role (${mappedBackendRole}) does not match the required role (${role}).`);
          return;
        }
        
        // Store user data including full name if available
        localStorage.setItem('userRole', backendRole);
        if (userData.full_name) {
          localStorage.setItem('full_name', userData.full_name);
        } else if (userData.username) {
          // Fallback: format username from email if full_name not available
          const formattedName = username.split('@')[0]
            .replace(/[._-]+/g, ' ')
            .split(' ')
            .filter(Boolean)
            .map(s => s.charAt(0).toUpperCase() + s.slice(1))
            .join(' ');
          localStorage.setItem('full_name', formattedName);
        }
        
        // Dispatch custom event to notify AppLayout of storage change
        window.dispatchEvent(new Event('localStorageChange'));
        
        showToast('success', 'Logged in successfully');
        
        // Redirect based on verified role
        if (backendRole === 'admin') {
          window.location.href = '/app/admin/profiles';
        } else {
          window.location.href = '/app/jobs';
        }
      } catch (roleErr) {
        showToast('error', 'Failed to verify user role. Please try again.');
        console.error('Role verification failed:', roleErr);
      }
    } catch (err) {
      const status = err?.status ? ` (HTTP ${err.status})` : '';
      let msg = 'Login failed';
      if (err.data) {
        if (Array.isArray(err.data)) {
          msg = err.data.map(e => e.msg || 'Validation error').join(', ');
        } else if (typeof err.data === 'object' && err.data.msg) {
          msg = err.data.msg;
        } else if (err.data.detail) {
          if (Array.isArray(err.data.detail)) {
            msg = err.data.detail.map(e => e.msg || 'Validation error').join(', ');
          } else if (typeof err.data.detail === 'object' && err.data.detail.msg) {
            msg = err.data.detail.msg;
          } else {
            msg = String(err.data.detail);
          }
        } else if (err.data.message) {
          msg = err.data.message;
        } else {
          msg = String(err.data);
        }
      }
      showToast('error', `${msg}${status}`);
    }
  };

  const handleEmailAuthOpen = () => {
    setEmailAuthOpen(true);
    setEmailAuthStep('email');
    setEmailAuthEmail('');
    setEmailAuthOtp('');
  };

  const handleEmailAuthClose = () => {
    setEmailAuthOpen(false);
    setEmailAuthStep('email');
    setEmailAuthEmail('');
    setEmailAuthOtp('');
  };

  // Forgot Password handlers
  const handleForgotPasswordOpen = () => {
    setForgotPasswordOpen(true);
    setForgotPasswordStep('email');
    setForgotPasswordEmail('');
    setForgotPasswordOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordStep('email');
    setForgotPasswordEmail('');
    setForgotPasswordOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleSendForgotOtp = async () => {
    if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
      showToast('error', 'Please enter a valid email address');
      return;
    }

    setSendingForgotOtp(true);
    try {
      // First check if email exists in database
      const response = await fetch(`${AUTH_ENDPOINTS.checkEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          showToast('error', 'No account found with this email. Please verify your email or register.');
          return;
        }
        throw new Error(errorData?.detail || errorData?.message || 'Email verification failed');
      }
      
      // If email exists, send password reset OTP
      await forgotPassword({ email: forgotPasswordEmail });
      setForgotPasswordStep('otp');
      showToast('success', 'OTP sent to your email');
    } catch (err) {
      let msg = err.message || 'Failed to send OTP';
      if (err.data) {
        if (Array.isArray(err.data)) {
          msg = err.data.map(e => e.msg || 'Validation error').join(', ');
        } else if (typeof err.data === 'object' && err.data.msg) {
          msg = err.data.msg;
        } else if (err.data.detail) {
          if (Array.isArray(err.data.detail)) {
            msg = err.data.detail.map(e => e.msg || 'Validation error').join(', ');
          } else if (typeof err.data.detail === 'object' && err.data.detail.msg) {
            msg = err.data.detail.msg;
          } else {
            msg = String(err.data.detail);
          }
        } else if (err.data.message) {
          msg = err.data.message;
        } else {
          msg = String(err.data);
        }
      }
      showToast('error', msg);
    } finally {
      setSendingForgotOtp(false);
    }
  };

  const handleVerifyForgotOtp = async () => {
    if (!forgotPasswordOtp || forgotPasswordOtp.length !== 6) {
      showToast('error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setVerifyingForgotOtp(true);
    try {
      await verifyEmail({ email: forgotPasswordEmail, otp: forgotPasswordOtp });
      setForgotPasswordStep('password');
      showToast('success', 'OTP verified successfully. Please enter your new password.');
    } catch (err) {
      let msg = 'Invalid OTP';
      if (err.data) {
        if (Array.isArray(err.data)) {
          msg = err.data.map(e => e.msg || 'Validation error').join(', ');
        } else if (typeof err.data === 'object' && err.data.msg) {
          msg = err.data.msg;
        } else if (err.data.detail) {
          if (Array.isArray(err.data.detail)) {
            msg = err.data.detail.map(e => e.msg || 'Validation error').join(', ');
          } else if (typeof err.data.detail === 'object' && err.data.detail.msg) {
            msg = err.data.detail.msg;
          } else {
            msg = String(err.data.detail);
          }
        } else if (err.data.message) {
          msg = err.data.message;
        } else {
          msg = String(err.data);
        }
      }
      showToast('error', msg);
    } finally {
      setVerifyingForgotOtp(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast('error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }

    setResettingPassword(true);
    try {
      await resetPassword({
        email: forgotPasswordEmail,
        otp: forgotPasswordOtp,
        new_password: newPassword
      });
      showToast('success', 'Password reset successfully. You can now login with your new password.');
      handleForgotPasswordClose();
    } catch (err) {
      let msg = 'Failed to reset password';
      if (err.data) {
        if (Array.isArray(err.data)) {
          msg = err.data.map(e => e.msg || 'Validation error').join(', ');
        } else if (typeof err.data === 'object' && err.data.msg) {
          msg = err.data.msg;
        } else if (err.data.detail) {
          if (Array.isArray(err.data.detail)) {
            msg = err.data.detail.map(e => e.msg || 'Validation error').join(', ');
          } else if (typeof err.data.detail === 'object' && err.data.detail.msg) {
            msg = err.data.detail.msg;
          } else {
            msg = String(err.data.detail);
          }
        } else if (err.data.message) {
          msg = err.data.message;
        } else {
          msg = String(err.data);
        }
      }
      showToast('error', msg);
    } finally {
      setResettingPassword(false);
    }
  };

    const handleSendOtp = async () => {
    if (!emailAuthEmail || !emailAuthEmail.includes('@')) {
      showToast('error', 'Please enter a valid email address');
      return;
    }

    setSendingOtp(true);
    try {
      // First check if email exists in database
const response = await fetch(`${AUTH_ENDPOINTS.checkEmail}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailAuthEmail })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 404) {
          showToast('error', 'No account found with this email. Please verify your email or register.');
          return;
        }
        throw new Error(errorData?.detail || errorData?.message || 'Email verification failed');
      }
      
      // If email exists, send OTP
      await resendOtp({ email: emailAuthEmail });
      setEmailAuthStep('otp');
      showToast('success', 'OTP sent to your email');
    } catch (err) {
      let msg = err.message || 'Failed to send OTP';
      if (err.data) {
        if (Array.isArray(err.data)) {
          msg = err.data.map(e => e.msg || 'Validation error').join(', ');
        } else if (typeof err.data === 'object' && err.data.msg) {
          msg = err.data.msg;
        } else if (err.data.detail) {
          if (Array.isArray(err.data.detail)) {
            msg = err.data.detail.map(e => e.msg || 'Validation error').join(', ');
          } else if (typeof err.data.detail === 'object' && err.data.detail.msg) {
            msg = err.data.detail.msg;
          } else {
            msg = String(err.data.detail);
          }
        } else if (err.data.message) {
          msg = err.data.message;
        } else {
          msg = String(err.data);
        }
      }
      showToast('error', msg);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!emailAuthOtp || emailAuthOtp.length !== 6) {
      showToast('error', 'Please enter a valid 6-digit OTP');
      return;
    }
    
    setVerifyingOtp(true);
    try {
      await verifyEmail({ email: emailAuthEmail, otp: emailAuthOtp });
      showToast('success', 'Email authorized successfully!');
      handleEmailAuthClose();
    } catch (err) {
      let msg = 'Invalid OTP';
      if (err.data) {
        if (Array.isArray(err.data)) {
          msg = err.data.map(e => e.msg || 'Validation error').join(', ');
        } else if (typeof err.data === 'object' && err.data.msg) {
          msg = err.data.msg;
        } else if (err.data.detail) {
          if (Array.isArray(err.data.detail)) {
            msg = err.data.detail.map(e => e.msg || 'Validation error').join(', ');
          } else if (typeof err.data.detail === 'object' && err.data.detail.msg) {
            msg = err.data.detail.msg;
          } else {
            msg = String(err.data.detail);
          }
        } else if (err.data.message) {
          msg = err.data.message;
        } else {
          msg = String(err.data);
        }
      }
      showToast('error', msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <>
      <Container component="main" maxWidth="sm">
        <Box className="login-root">
          <Paper elevation={6} className="login-card">
            <Box className="login-header">
              <Avatar className="login-avatar">
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Sign in
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Welcome back! 
              </Typography>
            </Box>

            <Toast open={toast.open} severity={toast.severity} message={toast.message} onClose={closeToast} />
            <Box component="form" onSubmit={handleSubmit} noValidate className="login-form">
              <TextField
                margin="normal"
                size="small"
                required
                fullWidth
                id="email"
                label="Email Address or Mobile Number"
                name="email"
                autoComplete="email"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon color="primary" />
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                margin="normal"
                size="small"
                required
                fullWidth
                name="password"
                label="Password"
                type={showLoginPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowLoginPassword((v) => !v)}
                        edge="end"
                        size="small"
                      >
                        {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  name="role"
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value)}
                  size="small"
                >
                  <MenuItem value="candidate">Candidate</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                  <FormControlLabel control={<Checkbox color="primary" />} label="Remember me" />
                </Grid>
                <Grid item sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
<Button
                    type="button"
                    variant="outlined"
                    size="small"
                    onClick={handleEmailAuthOpen}
                    startIcon={<MarkEmailReadOutlinedIcon />}
                    sx={{ width: 140, px: 1, height: 32, fontSize: '0.75rem', textTransform: 'none' }}
                  >
                    Authorize Email
                  </Button>
                  <Link
                    href="#"
                    variant="body2"
                    onClick={handleForgotPasswordOpen}
                    sx={{ cursor: 'pointer' }}
                  >
                    Forgot password?
                  </Link>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Button type="submit" fullWidth variant="contained" size="medium" className="login-submit">
                  Sign In
                </Button>
              </Box>
              <Grid container justifyContent="center">
                <Grid item>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    Don't have an account?{' '}
                    <Link component={RouterLink} to="/register">Sign Up</Link>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      </Container>

      {/* Email Authorization Modal */}
      <Dialog open={emailAuthOpen} onClose={handleEmailAuthClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {emailAuthStep === 'email' ? 'Authorize Email' : 'Enter OTP'}
        </DialogTitle>
        <DialogContent>
          {emailAuthStep === 'email' ? (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Email Address or Mobile Number"
                type="email"
                value={emailAuthEmail}
                onChange={(e) => setEmailAuthEmail(e.target.value)}
                placeholder="Enter your email or mobile number"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon color="primary" />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          ) : (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter the 6-digit OTP sent to {emailAuthEmail}
              </Typography>
              <TextField
                fullWidth
                label="OTP"
                type="text"
                value={emailAuthOtp}
                onChange={(e) => setEmailAuthOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                size="small"
                inputProps={{ maxLength: 6 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="primary" />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEmailAuthClose}>Cancel</Button>
          {emailAuthStep === 'email' ? (
            <Button 
              onClick={handleSendOtp} 
              variant="contained" 
              disabled={sendingOtp || !emailAuthEmail}
            >
              {sendingOtp ? 'Sending...' : 'Send OTP'}
            </Button>
          ) : (
            <Button 
              onClick={handleVerifyOtp} 
              variant="contained" 
              disabled={verifyingOtp || emailAuthOtp.length !== 6}
            >
              {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Forgot Password Modal */}
      <Dialog open={forgotPasswordOpen} onClose={handleForgotPasswordClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {forgotPasswordStep === 'email' ? 'Forgot Password' : 
           forgotPasswordStep === 'otp' ? 'Enter OTP' : 'Reset Password'}
        </DialogTitle>
        <DialogContent>
          {forgotPasswordStep === 'email' ? (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your email address to receive a password reset OTP
              </Typography>
              <TextField
                fullWidth
                label="Email Address or Mobile Number"
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="Enter your email or mobile number"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon color="primary" />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          ) : forgotPasswordStep === 'otp' ? (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter the 6-digit OTP sent to {forgotPasswordEmail}
              </Typography>
              <TextField
                fullWidth
                label="OTP"
                value={forgotPasswordOtp}
                onChange={(e) => setForgotPasswordOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                size="small"
                inputProps={{ maxLength: 6 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="primary" />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          ) : (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your new password
              </Typography>
              <TextField
                fullWidth
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowNewPassword((v) => !v)}
                        edge="end"
                        size="small"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                size="small"
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {forgotPasswordStep === 'email' ? (
            <Button onClick={handleForgotPasswordClose}>Cancel</Button>
          ) : forgotPasswordStep === 'otp' ? (
            <Button onClick={() => setForgotPasswordStep('email')}>Back</Button>
          ) : (
            <Button onClick={() => setForgotPasswordStep('otp')}>Back</Button>
          )}
          {forgotPasswordStep === 'email' ? (
            <Button 
              onClick={handleSendForgotOtp} 
              variant="contained" 
              disabled={sendingForgotOtp || !forgotPasswordEmail}
            >
              {sendingForgotOtp ? 'Sending...' : 'Send OTP'}
            </Button>
          ) : forgotPasswordStep === 'otp' ? (
            <Button 
              onClick={handleVerifyForgotOtp} 
              variant="contained" 
              disabled={verifyingForgotOtp || forgotPasswordOtp.length !== 6}
            >
              {verifyingForgotOtp ? 'Verifying...' : 'Verify OTP'}
            </Button>
          ) : (
            <Button 
              onClick={handleResetPassword} 
              variant="contained" 
              disabled={resettingPassword || !newPassword || newPassword !== confirmNewPassword}
            >
              {resettingPassword ? 'Resetting...' : 'Reset Password'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  const [isOtpOpen, setIsOtpOpen] = React.useState(false);
  const [otpDigits, setOtpDigits] = React.useState(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [registerEmail, setRegisterEmail] = React.useState('');
  const [toast, setToast] = React.useState({ open: false, severity: 'info', message: '' });
  const [showRegPassword, setShowRegPassword] = React.useState(false);
  const [showRegConfirm, setShowRegConfirm] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState('');
  const [countryCode, setCountryCode] = React.useState('+91');
  const [mobileNumber, setMobileNumber] = React.useState('');

  const showToast = (severity, message) => setToast({ open: true, severity, message });
  const closeToast = () => setToast({ ...toast, open: false });

  // Role mapping function
  const mapUiRoleToApi = (role) => (role === 'candidate' ? 'user' : role);

  const openOtp = () => setIsOtpOpen(true);
  const closeOtp = () => setIsOtpOpen(false);
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };
  const submitOtp = async () => {
    const code = otpDigits.join('').trim();
    if (!registerEmail) {
      showToast('error', 'Missing verification info. Please register again.');
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      showToast('error', 'Enter the 6-digit verification code.');
      return;
    }
    try {
      setVerifying(true);
      
      // Determine if it's email or mobile verification
      const isEmail = registerEmail.includes('@');
      const verificationPayload = isEmail 
        ? { email: registerEmail, otp: code }
        : { mobile_number: registerEmail, otp: code };
      
      await verifyEmail(verificationPayload);
      showToast('success', 'Email verified successfully. You can now sign in.');
      closeOtp();
      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      const status = err?.status ? ` (HTTP ${err.status})` : '';
      let detail = err?.message || 'Verification failed';
      if (err.data?.detail) {
        if (Array.isArray(err.data.detail)) {
          detail = err.data.detail.map(e => e.msg || 'Validation error').join(', ');
        } else {
          detail = err.data.detail;
        }
      } else if (err.data?.message) {
        detail = err.data.message;
      }
      showToast('error', `${detail}${status}`);
      console.error('verify-email error:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!registerEmail) return;
    try {
      setResending(true);
      
      // Determine if it's email or mobile resend
      const isEmail = registerEmail.includes('@');
      const resendPayload = isEmail 
        ? { email: registerEmail }
        : { mobile_number: registerEmail };
      
      await resendOtp(resendPayload);
      
      const message = isEmail 
        ? 'OTP resent to your email'
        : 'OTP resent to your mobile';
      showToast('info', message);
    } catch (err) {
      let msg = 'Failed to resend OTP';
      if (err.data?.detail) {
        if (Array.isArray(err.data.detail)) {
          msg = err.data.detail.map(e => e.msg || 'Validation error').join(', ');
        } else {
          msg = err.data.detail;
        }
      } else if (err.data?.message) {
        msg = err.data.message;
      }
      showToast('error', msg);
    } finally {
      setResending(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = data.get('email');
    const full_name = data.get('name');
    const password = data.get('password');
    const confirmPassword = data.get('confirmPassword');
    const role = mapUiRoleToApi(data.get('role') || 'candidate');
    
    // Validate that either email or mobile number is provided
    if (!email && !mobileNumber) {
      showToast('error', 'Please provide either email or mobile number.');
      return;
    }
    
    if (!password) {
      showToast('error', 'Please enter password.');
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      showToast('error', 'Passwords do not match');
      return;
    } else {
      setPasswordError('');
    }
    
    // Prepare registration data
    const mobile_number = mobileNumber ? `${countryCode}${mobileNumber}` : null;
    const username = email ? email.split('@')[0] : mobile_number;
    
    // Determine verification method
    const verificationMethod = email ? 'email' : 'mobile';
    const verificationTarget = email || mobile_number;
    
    try {
      setSubmitting(true);
      
      // Prepare the registration payload
      const registrationPayload = { 
        email: email || null, 
        username, 
        password, 
        full_name, 
        role, 
        mobile_number: mobile_number || null,
        verification_method: verificationMethod
      };
      
      // Ensure at least one contact method is provided
      if (!registrationPayload.email && !registrationPayload.mobile_number) {
        showToast('error', 'Please provide either email or mobile number.');
        return;
      }
      
      console.log('Registration payload:', registrationPayload);
      console.log('Email:', email);
      console.log('Mobile Number:', mobileNumber);
      console.log('Country Code:', countryCode);
      console.log('Mobile Number with country code:', mobile_number);
      
      // Test the registration request directly to see what's being sent
      console.log('Sending registration request...');
      
      // Try different payload formats if the first one fails
      try {
        await registerUser(registrationPayload);
      } catch (err) {
        console.log('First attempt failed, trying alternative format...');
        console.log('Error:', err);
        
        // Try with both fields present (even if one is empty)
        const alternativePayload = {
          email: email || '',
          username, 
          password, 
          full_name, 
          role, 
          mobile_number: mobile_number || '',
          verification_method: verificationMethod
        };
        
        console.log('Trying alternative payload:', alternativePayload);
        await registerUser(alternativePayload);
      }
      
      try { localStorage.setItem('full_name', full_name || ''); } catch (e) {}
      // Dispatch custom event to notify AppLayout of storage change
      window.dispatchEvent(new Event('localStorageChange'));
      
      // Store verification info for OTP screen
      setRegisterEmail(verificationTarget);
      setIsOtpOpen(true);
      
      const message = verificationMethod === 'email' 
        ? 'Registered. Please check your email for the verification code.'
        : 'Registered. Please check your mobile for the verification code.';
      showToast('success', message);
    } catch (err) {
      let msg = 'Registration failed';
      if (err.data?.detail) {
        if (Array.isArray(err.data.detail)) {
          msg = err.data.detail.map(e => e.msg || 'Validation error').join(', ');
        } else {
          msg = err.data.detail;
        }
      } else if (err.data?.message) {
        msg = err.data.message;
      }
      showToast('error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <Container component="main" maxWidth="sm">
      <Box className="login-root">
        <Paper elevation={6} className="login-card">
          <Box className="login-header">
            <Avatar className="login-avatar">
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Create account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join us..!
            </Typography>
          </Box>

          <Toast open={toast.open} severity={toast.severity} message={toast.message} onClose={closeToast} />
          <Box component="form" className="login-form" onSubmit={handleRegisterSubmit} noValidate>
            <TextField
              margin="normal"
              size="small"
              required
              fullWidth
              id="reg-name"
              label="Full Name"
              name="name"
              autoComplete="name"
            />
            <TextField
              margin="normal"
              size="small"
              fullWidth
              id="reg-email"
              label="Email Address (Optional)"
              name="email"
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="verify email" onClick={openOtp} edge="end" size="small">
                      <MarkEmailReadOutlinedIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Grid container spacing={1} sx={{ mt: 1 }}>
              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Country Code</InputLabel>
                  <Select
                    value={countryCode}
                    label="Country Code"
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    <MenuItem value="+91">India +91</MenuItem>
                    <MenuItem value="+1">USA +1</MenuItem>
                    <MenuItem value="+44">UK +44</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Mobile Number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="primary" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              margin="normal"
              size="small"
              required
              fullWidth
              name="password"
              label="Password"
              type={showRegPassword ? 'text' : 'password'}
              id="reg-password"
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowRegPassword((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {showRegPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              margin="normal"
              size="small"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showRegConfirm ? 'text' : 'password'}
              id="reg-confirm-password"
              autoComplete="new-password"
              error={Boolean(passwordError)}
              helperText={passwordError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowRegConfirm((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {showRegConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="reg-role-label">Role</InputLabel>
              <Select labelId="reg-role-label" id="reg-role" name="role" label="Role" defaultValue="candidate" size="small">
                <MenuItem value="candidate">Candidate</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit" fullWidth variant="contained" size="medium" className="login-submit" disabled={submitting}>
              Register
            </Button>
            <Grid container justifyContent="center">
              <Grid item>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/">Sign In</Link>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
    
    {/* Small OTP Modal */}
    <Dialog open={isOtpOpen} onClose={closeOtp} maxWidth="xs" fullWidth>
              <DialogTitle>Enter Your PIN Below</DialogTitle>
        <DialogContent>
          <Grid container spacing={1} justifyContent="center" sx={{ flexWrap: 'nowrap' }}>
            {otpDigits.map((d, i) => (
              <Grid item key={i}>
                <TextField
                  id={`otp-${i}`}
                  value={d}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  inputProps={{ maxLength: 1, inputMode: 'numeric', pattern: '[0-9]*', style: { textAlign: 'center', width: 36 } }}
                  size="small"
                  margin="dense"
                  sx={{ width: 40 }}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResend} disabled={resending}>{resending ? 'Resending…' : 'Resend'}</Button>
          <Button onClick={closeOtp}>Cancel</Button>
          <Button variant="contained" onClick={submitOtp} disabled={verifying}>{verifying ? 'Verifying…' : 'Verify OTP'}</Button>
        </DialogActions>
    </Dialog>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/app" element={<ProtectedRoute><AppLayout><div>Home</div></AppLayout></ProtectedRoute>} />
      <Route path="/app/jobs" element={<ProtectedRoute><AppLayout><Jobs /></AppLayout></ProtectedRoute>} />
      <Route path="/app/jobs/new" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><AddJob /></AppLayout></ProtectedRoute>} />
      <Route path="/app/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/app/admin/profiles" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><ProfilesList /></AppLayout></ProtectedRoute>} />
      <Route path="/app/admin/profiles/:id" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><ProfileDetail /></AppLayout></ProtectedRoute>} />
      <Route path="/app/admin/support" element={<ProtectedRoute allowedRoles={['admin']}><AppLayout><Support /></AppLayout></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
