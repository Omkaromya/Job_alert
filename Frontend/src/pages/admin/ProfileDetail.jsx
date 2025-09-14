import React from 'react';
import { Box, Button, Chip, Divider, Grid, Paper, Stack, Typography, CircularProgress, Alert } from '@mui/material';
import { useParams } from 'react-router-dom';
import { getProfile } from '../../api/users';

export default function ProfileDetail() {
  const { id } = useParams();
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const result = await getProfile(id);
        setProfile(result);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box>
        <Alert severity="info">Profile not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} sx={{ mb: 2 }} spacing={1}>
        <Typography variant="h5">{profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : (profile.full_name || profile.name || 'N/A')}</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined">Deactivate</Button>
          <Button color="error" variant="outlined">Delete</Button>
          <Button variant="contained" color="success">Approve</Button>
          <Button variant="contained" color="warning">Reject</Button>
        </Stack>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Basic Info</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><strong>Email:</strong> {profile.email}</Grid>
          <Grid item xs={12} sm={6}><strong>Phone:</strong> {profile.mobile_number || 'N/A'}</Grid>
          <Grid item xs={12} sm={6}><strong>Location:</strong> {profile.location || profile.city || 'N/A'}</Grid>
          <Grid item xs={12} sm={6}><strong>Bio:</strong> {profile.bio || 'N/A'}</Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Skills</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {(profile.skills || []).map((s) => <Chip key={s} label={s} />)}
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Education</Typography>
        {(profile.education || []).map((e, idx) => (
          <Typography key={idx}>{e.degree_qualification || e.degree}, {e.institution} — {e.end_year || e.year}</Typography>
        ))}
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Projects / Portfolio</Typography>
        {(profile.projects || []).map((p, idx) => (
          <Box key={idx} sx={{ mb: 1 }}>
            <Typography><strong>{p.project_title || p.title}</strong></Typography>
            <Typography variant="body2" color="text.secondary">{p.description || p.desc}</Typography>
            <Typography variant="body2" color="primary"><a href={p.live_github_link || p.link} target="_blank" rel="noreferrer">{p.live_github_link || p.link}</a></Typography>
          </Box>
        ))}
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Job Preferences</Typography>
        <Typography>Desired role: {profile.current_job_title || profile.job_preferences?.preferred_job_title || 'N/A'}</Typography>
        <Typography>Location: {profile.job_preferences?.job_location_preferences || 'N/A'}</Typography>
        <Typography>Expected Salary: {profile.job_preferences?.expected_salary_ctc || 'N/A'}</Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Resume / CV</Typography>
          <Button variant="outlined" href={profile.resume_url} target="_blank">Download PDF</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Profile Status</Typography>
        <Stack direction="row" spacing={1}>
          <Chip label={profile.is_active ? 'Active' : 'Inactive'} color={profile.is_active ? 'success' : 'error'} />
        </Stack>
      </Paper>
    </Box>
  );
}







