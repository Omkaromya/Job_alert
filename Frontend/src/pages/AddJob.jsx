import React from 'react';
import { 
  Box, 
  Button, 
  Chip, 
  Divider, 
  Grid, 
  MenuItem, 
  Paper, 
  Stack, 
  TextField, 
  Typography,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ListAltIcon from '@mui/icons-material/ListAlt';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import { createJob, getJobs, updateJob, deleteJob } from '../api/auth';

export default function AddJob() {
  const [title, setTitle] = React.useState('');
  const [company, setCompany] = React.useState('');
  const [industry, setIndustry] = React.useState('');
  const [empType, setEmpType] = React.useState('');
  const [workMode, setWorkMode] = React.useState('');
  const [city, setCity] = React.useState('');
  const [state, setState] = React.useState('');
  const [country, setCountry] = React.useState('');
  const [zip, setZip] = React.useState('');
  const [experience, setExperience] = React.useState('');
  const [education, setEducation] = React.useState('');
  const [skills, setSkills] = React.useState([]);
  const [skillInput, setSkillInput] = React.useState('');
  const [salaryType, setSalaryType] = React.useState('');
  const [salaryMin, setSalaryMin] = React.useState('');
  const [salaryMax, setSalaryMax] = React.useState('');
  const [perks, setPerks] = React.useState([]);
  const [perkInput, setPerkInput] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [responsibilities, setResponsibilities] = React.useState('');
  const [requirements, setRequirements] = React.useState('');
  const [deadline, setDeadline] = React.useState('');
  const [applyMethod, setApplyMethod] = React.useState('');
  const [applyLink, setApplyLink] = React.useState('');
  const [openings, setOpenings] = React.useState('1');
  const [recruiterEmail, setRecruiterEmail] = React.useState('');
  const [recruiterPhone, setRecruiterPhone] = React.useState('');
  const [status, setStatus] = React.useState('Active');
  const [visibility, setVisibility] = React.useState('Public');
  const [tags, setTags] = React.useState([]);
  const [tagInput, setTagInput] = React.useState('');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [publishedJobs, setPublishedJobs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  React.useEffect(() => {
    try {
      const u = localStorage.getItem('username');
      if (u) setCompany(u.split('@')[0]);
    } catch (e) {}
    
    // Load published jobs from backend
    loadPublishedJobs();
  }, []);

  const testCreateJob = async () => {
    try {
      const testPayload = {
        job_title: 'Test Software Engineer',
        company_name: 'Test Company',
        industry: 'IT',
        employment_type: 'full_time',
        work_mode: 'remote',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        experience_required: '2-5 years',
        education_required: 'Bachelor\'s',
        skills_required: 'Python, React, Django',
        salary_type: 'monthly',
        salary_min: 50000,
        salary_max: 80000,
        job_summary: 'This is a test job posting',
        roles_responsibilities: 'Test responsibilities',
        key_requirements: 'Test requirements',
        application_deadline: '2024-12-31T23:59:59',
        how_to_apply: 'quick_apply',
        number_of_openings: 1,
        hiring_manager: 'Test Manager',
        recruiter_contact: 'test@example.com',
        job_status: 'active',
        visibility: 'public',
        tags: 'Test, Demo'
      };

      console.log('Testing job creation with payload:', testPayload);
      const response = await createJob(testPayload);
      console.log('Test job created:', response);
      
      // Reload jobs after creating test job
      setTimeout(() => loadPublishedJobs(), 1000);
    } catch (error) {
      console.error('Test job creation failed:', error);
      setError('Test job creation failed: ' + (error?.data?.detail || error?.message));
    }
  };

  const loadPublishedJobs = async () => {
    setLoading(true);
    setError('');
    
    // Debug: Check if token exists
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    
    try {
      // Try both my-jobs and regular jobs endpoint with page and size query parameters
      let response = await fetch('http://127.0.0.1:8000/api/v1/jobs/my-jobs/?page=1&size=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('My Jobs API Response:', data); // Debug log
        
        // Handle different response structures
        let jobs = [];
        if (data && data.results) {
          jobs = data.results;
        } else if (data && Array.isArray(data)) {
          jobs = data;
        } else if (data && data.data) {
          jobs = data.data;
        }
        
        if (jobs && jobs.length > 0) {
          setPublishedJobs(jobs.map(job => ({
            id: job.id,
            title: job.job_title || job.title,
            company: job.company_name || job.company,
            status: job.job_status || job.status,
            postedDate: job.created_at ? new Date(job.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          })));
        } else {
          // If my-jobs returns empty, try the regular jobs endpoint
          console.log('My-jobs returned empty, trying regular jobs endpoint...');
          const fallbackResponse = await fetch('http://127.0.0.1:8000/api/v1/jobs', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log('Fallback Jobs API Response:', fallbackData);
            
            if (fallbackData && fallbackData.results && fallbackData.results.length > 0) {
              setPublishedJobs(fallbackData.results.map(job => ({
                id: job.id,
                title: job.job_title || job.title,
                company: job.company_name || job.company,
                status: job.job_status || job.status,
                postedDate: job.created_at ? new Date(job.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
              })));
            } else {
              setPublishedJobs([]);
            }
          } else {
            setPublishedJobs([]);
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.detail || 'Failed to load jobs');
      }
    } catch (error) {
      console.error('Failed to load published jobs:', error);
      setError('Failed to load published jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addEntry = (value, setter) => {
    const v = value.trim();
    if (!v) return;
    setter((prev) => Array.from(new Set([...prev, v])));
  };

  const removeEntry = (value, setter) => setter((prev) => prev.filter((x) => x !== value));

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditJob = (jobId) => {
    console.log('Edit job:', jobId);
    handleMenuClose();
    // TODO: Navigate to edit job page or open edit form
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(jobId);
        setPublishedJobs(prev => prev.filter(job => job.id !== jobId));
        setSuccess('Job deleted successfully!');
      } catch (error) {
        console.error('Failed to delete job:', error);
        setError('Failed to delete job. Please try again.');
      }
      handleMenuClose();
    }
  };

  const handleUnpublishJob = async (jobId) => {
    try {
      await updateJob(jobId, { job_status: 'draft' });
      setPublishedJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: 'draft' } : job
      ));
      setSuccess('Job unpublished successfully!');
    } catch (error) {
      console.error('Failed to unpublish job:', error);
      setError('Failed to unpublish job. Please try again.');
    }
    handleMenuClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!title.trim() || !company.trim()) {
      setError('Job title and company name are required.');
      setSubmitting(false);
      return;
    }

    try {
      // Prepare payload according to backend API specification
      const payload = {
        job_title: title,
        company_name: company,
        industry: industry,
        employment_type: empType.toLowerCase().replace('-', '_'),
        work_mode: workMode.toLowerCase().replace('-', '_'),
        city: city,
        state: state,
        country: country,
        experience_required: experience,
        education_required: education,
        skills_required: skills.join(', '),
        salary_type: salaryType.toLowerCase(),
        salary_min: parseFloat(salaryMin) || 0,
        salary_max: parseFloat(salaryMax) || 0,
        job_summary: summary,
        roles_responsibilities: responsibilities,
        key_requirements: requirements,
        application_deadline: deadline ? `${deadline}T23:59:59` : null,
        how_to_apply: applyMethod.toLowerCase().replace(' ', '_'),
        number_of_openings: parseInt(openings) || 1,
        hiring_manager: recruiterEmail ? 'Hiring Manager' : '',
        recruiter_contact: `${recruiterEmail || ''}, ${recruiterPhone || ''}`.trim(),
        job_status: status.toLowerCase(),
        visibility: visibility.toLowerCase().replace(' ', '_'),
        tags: tags.join(', ')
      };

      console.log('Add Job payload', payload);

      // Send API request to backend
      const response = await createJob(payload);
      
      if (response && response.id) {
        setSuccess('Job posted successfully!');
        
        // Add the new job to published jobs list
        const newJob = {
          id: response.id,
          title: response.job_title,
          company: response.company_name,
          status: response.job_status,
          postedDate: new Date(response.created_at).toISOString().split('T')[0]
        };
        setPublishedJobs(prev => [newJob, ...prev]);
        
        // Reset form
        resetForm();
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (error) {
      console.error('Failed to post job:', error);
      setError(error?.data?.detail || error?.message || 'Failed to post job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCompany('');
    setIndustry('');
    setEmpType('');
    setWorkMode('');
    setCity('');
    setState('');
    setCountry('');
    setZip('');
    setExperience('');
    setEducation('');
    setSkills([]);
    setSkillInput('');
    setSalaryType('');
    setSalaryMin('');
    setSalaryMax('');
    setPerks([]);
    setPerkInput('');
    setSummary('');
    setResponsibilities('');
    setRequirements('');
    setDeadline('');
    setApplyMethod('');
    setApplyLink('');
    setOpenings('1');
    setRecruiterEmail('');
    setRecruiterPhone('');
    setStatus('Active');
    setVisibility('Public');
    setTags([]);
    setTagInput('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {/* Error and Success Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Post a Job</Typography>
        <IconButton
          onClick={handleMenuOpen}
          sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': { 
              backgroundColor: 'action.hover',
              borderColor: 'primary.main'
            }
          }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { minWidth: 200 }
          }}
        >
                     <MenuItem onClick={handleMenuClose}>
             <ListItemIcon>
               <ListAltIcon fontSize="small" />
             </ListItemIcon>
             <ListItemText>Published Jobs</ListItemText>
           </MenuItem>
                       <MenuItem onClick={() => { loadPublishedJobs(); handleMenuClose(); }}>
              <ListItemIcon>
                <CircularProgress size={16} />
              </ListItemIcon>
              <ListItemText>Refresh Jobs</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { testCreateJob(); handleMenuClose(); }}>
              <ListItemIcon>
                <CircularProgress size={16} />
              </ListItemIcon>
              <ListItemText>Test Create Job</ListItemText>
            </MenuItem>
           <Divider />
           {loading ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
               <CircularProgress size={24} />
             </Box>
           ) : publishedJobs.length === 0 ? (
             <Box sx={{ p: 2, textAlign: 'center' }}>
               <Typography variant="body2" color="text.secondary">
                 No jobs posted yet
               </Typography>
             </Box>
           ) : (
             publishedJobs.map((job) => (
            <Box key={job.id}>
              <MenuItem sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {job.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {job.company} • {job.status} • {job.postedDate}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, width: '100%' }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditJob(job.id);
                    }}
                    sx={{ flex: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteJob(job.id);
                    }}
                    sx={{ flex: 1 }}
                  >
                    Delete
                  </Button>
                  {job.status === 'Active' && (
                                         <Button
                       size="small"
                       startIcon={<BlockIcon />}
                       color="warning"
                       onClick={(e) => {
                         e.stopPropagation();
                         handleUnpublishJob(job.id);
                       }}
                       sx={{ flex: 1 }}
                     >
                       Unpublish
                     </Button>
                  )}
                </Stack>
              </MenuItem>
                             {job.id !== publishedJobs[publishedJobs.length - 1].id && <Divider />}
             </Box>
           ))
           )}
         </Menu>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Job Info</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField size="small" fullWidth label="Job Title" value={title} onChange={(e) => setTitle(e.target.value)} /></Grid>
          <Grid item xs={12} sm={6}><TextField size="small" fullWidth label="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} /></Grid>
          <Grid item xs={12} sm={6}><TextField size="small" select fullWidth label="Industry / Category" value={industry} onChange={(e) => setIndustry(e.target.value)}>
            {['IT','Finance','Marketing','Healthcare','Education','Other'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
          </TextField></Grid>
          <Grid item xs={12} sm={6}><TextField size="small" select fullWidth label="Employment Type" value={empType} onChange={(e) => setEmpType(e.target.value)}>
            {['Full-time','Part-time','Internship','Contract','Freelance','Remote'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
          </TextField></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Location</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}><TextField size="small" select fullWidth label="Work Mode" value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
            {['On-site','Remote','Hybrid'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
          </TextField></Grid>
          <Grid item xs={12} sm={3}><TextField size="small" fullWidth label="City" value={city} onChange={(e) => setCity(e.target.value)} /></Grid>
          <Grid item xs={12} sm={3}><TextField size="small" fullWidth label="State/Province" value={state} onChange={(e) => setState(e.target.value)} /></Grid>
          <Grid item xs={12} sm={3}><TextField size="small" fullWidth label="Country" value={country} onChange={(e) => setCountry(e.target.value)} /></Grid>
          <Grid item xs={12} sm={3}><TextField size="small" fullWidth label="Zip/Postal Code" value={zip} onChange={(e) => setZip(e.target.value)} /></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Experience & Education</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><TextField size="small" select fullWidth label="Required Experience" value={experience} onChange={(e) => setExperience(e.target.value)}>
            {['Fresher','0–2 years','2–5 years','5+ years'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
          </TextField></Grid>
          <Grid item xs={12} sm={4}><TextField size="small" select fullWidth label="Education Qualification" value={education} onChange={(e) => setEducation(e.target.value)}>
            {['Any Graduate','Diploma','Bachelor’s','Master’s','Doctorate'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
          </TextField></Grid>
          <Grid item xs={12} sm={4}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField size="small" fullWidth label="Add Skill" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e)=> e.key==='Enter'? (addEntry(skillInput, setSkills), setSkillInput('')):null} />
              <Button variant="outlined" onClick={()=> { addEntry(skillInput, setSkills); setSkillInput(''); }}>Add</Button>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
              {skills.map((s) => <Chip key={s} label={s} onDelete={() => removeEntry(s, setSkills)} />)}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Salary & Benefits</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}><TextField size="small" select fullWidth label="Salary Type" value={salaryType} onChange={(e) => setSalaryType(e.target.value)}>
            {['Monthly','Annual','Hourly','Negotiable'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
          </TextField></Grid>
          <Grid item xs={12} sm={3}><TextField size="small" fullWidth label="Min" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} /></Grid>
          <Grid item xs={12} sm={3}><TextField size="small" fullWidth label="Max" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} /></Grid>
          <Grid item xs={12}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField size="small" fullWidth label="Add Perk/Benefit" value={perkInput} onChange={(e) => setPerkInput(e.target.value)} onKeyDown={(e)=> e.key==='Enter'? (addEntry(perkInput, setPerks), setPerkInput('')):null} />
              <Button variant="outlined" onClick={()=> { addEntry(perkInput, setPerks); setPerkInput(''); }}>Add</Button>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
              {perks.map((p) => <Chip key={p} label={p} onDelete={() => removeEntry(p, setPerks)} />)}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Job Description</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}><TextField size="small" fullWidth label="Job Summary" value={summary} onChange={(e) => setSummary(e.target.value)} /></Grid>
          <Grid item xs={12}><TextField size="small" fullWidth multiline minRows={4} label="Roles & Responsibilities" value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} /></Grid>
          <Grid item xs={12}><TextField size="small" fullWidth multiline minRows={3} label="Key Requirements" value={requirements} onChange={(e) => setRequirements(e.target.value)} /></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Application Settings</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><TextField size="small" fullWidth type="date" label="Application Deadline" InputLabelProps={{ shrink: true }} value={deadline} onChange={(e) => setDeadline(e.target.value)} /></Grid>
          <Grid item xs={12} sm={4}><TextField size="small" select fullWidth label="How to Apply" value={applyMethod} onChange={(e) => setApplyMethod(e.target.value)}>
            {['Quick Apply','External Link','Email'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
          </TextField></Grid>
          <Grid item xs={12} sm={4}><TextField size="small" fullWidth label="Apply Link / Email" value={applyLink} onChange={(e) => setApplyLink(e.target.value)} /></Grid>
          <Grid item xs={12} sm={4}><TextField size="small" fullWidth label="Number of Openings" value={openings} onChange={(e) => setOpenings(e.target.value)} /></Grid>
          <Grid item xs={12} sm={4}><TextField size="small" fullWidth label="Recruiter Email (optional)" value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} /></Grid>
          <Grid item xs={12} sm={4}><TextField size="small" fullWidth label="Recruiter Phone (optional)" value={recruiterPhone} onChange={(e) => setRecruiterPhone(e.target.value)} /></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Other Settings</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><TextField size="small" select fullWidth label="Job Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            {['Active','Draft','Closed'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
          </TextField></Grid>
          <Grid item xs={12} sm={4}><TextField size="small" select fullWidth label="Visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            {['Public','Private','Only registered candidates'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
          </TextField></Grid>
          <Grid item xs={12} sm={4}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField size="small" fullWidth label="Add Tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e)=> e.key==='Enter'? (addEntry(tagInput, setTags), setTagInput('')):null} />
              <Button variant="outlined" onClick={()=> { addEntry(tagInput, setTags); setTagInput(''); }}>Add</Button>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
              {tags.map((t) => <Chip key={t} label={t} onDelete={() => removeEntry(t, setTags)} />)}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Stack direction="row" justifyContent="flex-end" spacing={2}>
        <Button variant="outlined" onClick={resetForm} disabled={submitting}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          type="submit" 
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
        >
          {submitting ? 'Publishing...' : 'Publish Job'}
        </Button>
      </Stack>
    </Box>
  );
}







