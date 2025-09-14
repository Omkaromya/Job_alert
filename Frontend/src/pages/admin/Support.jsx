import React from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Checkbox
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { getUsers, updateUser, deleteUser } from '../../api/users';

export default function Support() {
  const [q, setQ] = React.useState('');
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(null);
  const [editForm, setEditForm] = React.useState({});
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [updating, setUpdating] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (search = '') => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers({ skip: 0, limit: 100, search });
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchValue) => {
    setQ(searchValue);
    fetchUsers(searchValue);
  };

  const filtered = users.filter(r =>
    r.full_name?.toLowerCase().includes(q.toLowerCase()) ||
    r.email?.toLowerCase().includes(q.toLowerCase()) ||
    r.role?.toLowerCase().includes(q.toLowerCase())
  );

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      mobile_number: user.mobile_number,
      location: user.location
    });
    setEditDialogOpen(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        fetchUsers(q); // Refresh the list
      } catch (err) {
        alert('Failed to delete user: ' + err.message);
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      setUpdating(true);
      await updateUser(selectedUser.id, editForm);
      setEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers(q); // Refresh the list
    } catch (err) {
      alert('Failed to update user: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} sx={{ mb: 2 }} spacing={1}>
        <Typography variant="h5">Support - User Management</Typography>
        <TextField size="small" placeholder="Search full name, email or role" value={q} onChange={(e)=> setQ(e.target.value)} />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflow: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedUsers.length > 0 && selectedUsers.length < filtered.length}
                      checked={filtered.length > 0 && selectedUsers.length === filtered.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filtered.map((r) => r.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      inputProps={{ 'aria-label': 'select all users' }}
                    />
                  </TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Skills</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((r) => {
                  const isItemSelected = selectedUsers.indexOf(r.id) !== -1;
                  return (
                    <TableRow
                      key={r.id}
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      selected={isItemSelected}
                      onClick={() => handleEdit(r)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isItemSelected}
                          onChange={(e) => {
                            const selectedIndex = selectedUsers.indexOf(r.id);
                            let newSelected = [];

                            if (selectedIndex === -1) {
                              newSelected = newSelected.concat(selectedUsers, r.id);
                            } else if (selectedIndex === 0) {
                              newSelected = newSelected.concat(selectedUsers.slice(1));
                            } else if (selectedIndex === selectedUsers.length - 1) {
                              newSelected = newSelected.concat(selectedUsers.slice(0, -1));
                            } else if (selectedIndex > 0) {
                              newSelected = newSelected.concat(
                                selectedUsers.slice(0, selectedIndex),
                                selectedUsers.slice(selectedIndex + 1)
                              );
                            }
                            setSelectedUsers(newSelected);
                          }}
                          inputProps={{ 'aria-labelledby': `user-checkbox-${r.id}` }}
                        />
                      </TableCell>
                      <TableCell component="th" id={`user-checkbox-${r.id}`} scope="row">
                        {r.full_name}
                      </TableCell>
                      <TableCell>{r.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={r.role}
                          color={r.role === 'admin' ? 'error' : r.role === 'user' ? 'warning' : 'primary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{r.mobile_number}</TableCell>
                      <TableCell>{r.location}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {r.skills ? r.skills.map((s) => <Chip key={s} label={s} size="small" variant="outlined" />) : null}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={r.is_active ? 'Active' : 'Inactive'}
                          color={r.is_active ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {selectedUsers.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="contained"
                color="error"
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} selected user(s)?`)) {
                    try {
                      for (const userId of selectedUsers) {
                        await deleteUser(userId);
                      }
                      setSelectedUsers([]);
                      fetchUsers(q);
                    } catch (err) {
                      alert('Failed to delete users: ' + err.message);
                    }
                  }
                }}
              >
                Delete
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCancelEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={editForm.full_name || ''}
              onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
              size="small"
            />
            <TextField
              fullWidth
              label="Email"
              value={editForm.email || ''}
              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              size="small"
            />
            <TextField
              fullWidth
              label="Phone"
              value={editForm.mobile_number || ''}
              onChange={(e) => setEditForm({...editForm, mobile_number: e.target.value})}
              size="small"
            />
            <TextField
              fullWidth
              label="Location"
              value={editForm.location || ''}
              onChange={(e) => setEditForm({...editForm, location: e.target.value})}
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Role</InputLabel>
              <Select
                value={editForm.role || 'user'}
                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                label="Role"
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="candidate">Candidate</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={editForm.is_active ?? true}
                onChange={(e) => setEditForm({...editForm, is_active: e.target.value === 'true'})}
                label="Status"
              >
                <MenuItem value={true}>Active</MenuItem>
                <MenuItem value={false}>Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
