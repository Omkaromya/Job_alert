import React from 'react';
import { Box, Button, Chip, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { getUsers, getProfile } from '../../api/users';

export default function ProfilesList() {
  const [q, setQ] = React.useState('');
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const usersResult = await getUsers({ skip: 0, limit: 100, search: q });
        const users = usersResult.users || usersResult;
        
        const profiles = await Promise.all(users.map(user => getProfile(user.id)));
        setData(profiles);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load profiles');
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [q]);

  const filtered = data.filter(r => r.full_name?.toLowerCase().includes(q.toLowerCase()) || r.email?.toLowerCase().includes(q.toLowerCase()));

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

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} sx={{ mb: 2 }} spacing={1}>
        <Typography variant="h5">User Profiles</Typography>
        <TextField size="small" placeholder="Search name or email" value={q} onChange={(e)=> setQ(e.target.value)} />
      </Stack>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Skills</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((r) => {
              console.log('User data for row:', r);
              console.log('Full name value:', r.full_name, 'Name value:', r.name);
              return (
                <TableRow key={r.id} hover>
                  <TableCell>{r.first_name && r.last_name ? `${r.first_name} ${r.last_name}` : (r.full_name || r.name || 'N/A')}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {(r.skills || []).map((s) => <Chip key={s} label={s} size="small" />)}
                    </Stack>
                  </TableCell>
                  <TableCell>{r.location || r.city || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip label={r.is_active ? 'Active' : 'Inactive'} color={r.is_active ? 'success' : 'error'} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={()=> navigate(`/app/admin/profiles/${r.id}`)} size="small"><VisibilityIcon /></IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}







