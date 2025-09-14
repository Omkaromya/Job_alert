import React from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, InputAdornment, MenuItem, Pagination, Paper, Stack, TextField, Typography, ToggleButton, ToggleButtonGroup, CircularProgress, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getJobs, getMyJobs } from '../api/auth';

function JobCard({ job, onView }) {
  // Format the job data for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const formatSalary = (min, max, type) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `₹${min.toLocaleString()} - ₹${max.toLocaleString()} ${type}`;
    if (min) return `₹${min.toLocaleString()}+ ${type}`;
    if (max) return `Up to ₹${max.toLocaleString()} ${type}`;
    return 'Salary not specified';
  };

  return (
    <Paper sx={{ p: 2, '&:hover': { boxShadow: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
            {job.job_title || job.title}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {job.company_name || job.company} • {job.city || 'Location not specified'}
          </Typography>
          
          <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
            {job.employment_type && (
              <Chip label={job.employment_type.replace('_', ' ')} size="small" color="primary" variant="outlined" />
            )}
            {job.work_mode && (
              <Chip label={job.work_mode.replace('_', ' ')} size="small" color="secondary" variant="outlined" />
            )}
            {job.experience_required && (
              <Chip label={job.experience_required} size="small" color="info" variant="outlined" />
            )}
            {job.industry && (
              <Chip label={job.industry} size="small" color="success" variant="outlined" />
            )}
          </Stack>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {formatSalary(job.salary_min, job.salary_max, job.salary_type)}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ 
            display: '-webkit-box', 
            WebkitLineClamp: 2, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden',
            mb: 1
          }}>
            {job.job_summary || job.description || 'No description available'}
          </Typography>
          
          <Typography variant="caption" color="text.secondary">
            Posted {formatDate(job.created_at)}
          </Typography>
        </Box>
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ minWidth: 'fit-content' }}>
          <Button variant="outlined" size="small" onClick={() => onView(job)}>
            View Details
          </Button>
          <Button variant="contained" size="small">
            Apply Now
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function Jobs() {
  const [q, setQ] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [exp, setExp] = React.useState('');
  const [jobType, setJobType] = React.useState('');
  const [industry, setIndustry] = React.useState('');
  const [posted, setPosted] = React.useState('');
  const [salaryMin, setSalaryMin] = React.useState('');
  const [salaryMax, setSalaryMax] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  
  // New state for backend integration
  const [jobs, setJobs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalJobs, setTotalJobs] = React.useState(0);

  // Get user role from localStorage
  const userRole = localStorage.getItem('userRole');

  // Fetch jobs from backend
  const fetchJobs = React.useCallback(async (filters = {}) => {
    setLoading(true);
    setError('');
    
    try {
      const queryParams = {
        page: page,
        size: 10, // Jobs per page
        ...filters
      };

      // Add search query if provided
      if (q.trim()) {
        queryParams.search = q.trim();
      }

      // Add location filter if provided
      if (location.trim()) {
        queryParams.location = location.trim();
      }

      // Add other filters
      if (exp) queryParams.experience = exp;
      if (jobType) queryParams.job_type = jobType.toLowerCase().replace('-', '_');
      if (industry) queryParams.industry = industry;
      if (salaryMin) queryParams.salary_min = parseFloat(salaryMin);
      if (salaryMax) queryParams.salary_max = parseFloat(salaryMax);

      console.log('Fetching jobs with params:', queryParams);

      let response;
      if (userRole === 'admin') {
        response = await getMyJobs(queryParams);
      } else {
        response = await getJobs(queryParams);
      }

      console.log('Jobs API Response:', response);
      console.log('Response type:', typeof response);
      console.log('Response is array:', Array.isArray(response));
      console.log('Response keys:', response ? Object.keys(response) : 'No response');

      // Handle different response structures
      let jobsData = [];
      let totalCount = 0;

      if (response && response.results) {
        // Django REST Framework pagination format
        jobsData = response.results;
        totalCount = response.count || response.results.length;
      } else if (response && Array.isArray(response)) {
        // Direct array response
        jobsData = response;
        totalCount = response.length;
      } else if (response && response.data) {
        // Alternative format
        jobsData = response.data;
        totalCount = response.total || response.data.length;
      } else if (response && typeof response === 'object') {
        // Single job object or other format
        jobsData = [response];
        totalCount = 1;
      }

      console.log('Processed jobs data:', jobsData);
      console.log('Total count:', totalCount);

      if (jobsData && jobsData.length > 0) {
        setJobs(jobsData);
        setTotalJobs(totalCount);
        setTotalPages(Math.ceil(totalCount / 10));
      } else {
        setJobs([]);
        setTotalJobs(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setError('Failed to load jobs. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [q, location, exp, jobType, industry, salaryMin, salaryMax, page, userRole]);

  // Load jobs on component mount
  React.useEffect(() => {
    fetchJobs();
  }, []); // Empty dependency array to run only once on mount

  // Debug: Monitor jobs state changes
  React.useEffect(() => {
    console.log('Jobs state changed:', { jobs, totalJobs, totalPages, loading, error });
  }, [jobs, totalJobs, totalPages, loading, error]);

  // Handle search and filter changes
  const handleSearch = () => {
    setPage(1); // Reset to first page
    fetchJobs();
  };

  const handleFilterChange = () => {
    setPage(1); // Reset to first page
    fetchJobs();
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const clearFilters = () => {
    setQ('');
    setLocation('');
    setExp('');
    setJobType('');
    setIndustry('');
    setPosted('');
    setSalaryMin('');
    setSalaryMax('');
    setPage(1);
    // Manually fetch jobs after clearing filters
    setTimeout(() => {
      fetchJobs();
    }, 100);
  };

  const manualRefresh = async () => {
    setLoading(true);
    setError('');
    
    try {
      const queryParams = {
        page: page,
        size: 10
      };
      
      console.log('Manual refresh with params:', queryParams);
      const response = await getJobs(queryParams);
      console.log('Manual refresh response:', response);
      
      // Handle different response structures
      let jobsData = [];
      let totalCount = 0;
      
      if (response && response.results) {
        jobsData = response.results;
        totalCount = response.count || response.results.length;
      } else if (response && Array.isArray(response)) {
        jobsData = response;
        totalCount = response.length;
      } else if (response && response.data) {
        jobsData = response.data;
        totalCount = response.total || response.data.length;
      }
      
      console.log('Manual refresh processed data:', jobsData);
      
      if (jobsData && jobsData.length > 0) {
        setJobs(jobsData);
        setTotalJobs(totalCount);
        setTotalPages(Math.ceil(totalCount / 10));
      } else {
        setJobs([]);
        setTotalJobs(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Manual refresh failed:', error);
      setError('Failed to refresh jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Find Jobs</Typography>
        <TextField
          size="small"
          sx={{ width: { xs: '100%', sm: 200, md: 250 } }}
          placeholder="Keyword, Job Title, Company"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>)
          }}
        />
        <TextField
          size="small"
          sx={{ width: { xs: '100%', sm: 200, md: 250 } }}
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        {/* <Button size="small" variant="outlined" onClick={() => setFiltersOpen(true)}>
          Filters
        </Button> */}
        <Button size="small" variant="contained" onClick={handleSearch}>
          Search
        </Button>
        <Button size="small" variant="outlined" onClick={manualRefresh}>
          Refresh
        </Button>
        {/* <Button size="small" variant="outlined" color="secondary" onClick={clearFilters}>
          Clear Filters
        </Button> */}
        {/* <Button size="small" variant="outlined" color="warning" onClick={() => {
          console.log('Current jobs state:', jobs);
          console.log('Setting test job...');
          setJobs([{
            id: 1,
            job_title: 'Test Job',
            company_name: 'Test Company',
            city: 'Test City',
            employment_type: 'full_time',
            work_mode: 'remote',
            experience_required: '2-5 years',
            industry: 'IT',
            salary_min: 50000,
            salary_max: 80000,
            salary_type: 'monthly',
            job_summary: 'This is a test job for debugging'
          }]);
        }}>
          Test Set Jobs
        </Button> */}
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Stack spacing={2}>
            {/* Loading State */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : jobs.length > 0 ? (
              <>
                {/* Jobs Count */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Showing {jobs.length} of {totalJobs} jobs
                </Typography>
                
                {/* Debug Info */}
                {/* <Box sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1, mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Debug: Jobs array length: {jobs.length} | Total: {totalJobs} | Page: {page}
                  </Typography>
                </Box> */}
                
                {/* Job Cards */}
                <Grid container spacing={2}>
                  {jobs.map((j) => (
                    <Grid item xs={12} sm={6} md={6} key={j.id}>
                      <JobCard job={j} onView={setSelected} />
                    </Grid>
                  ))}
                </Grid>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <>
                    <Divider />
                    <Stack direction="row" justifyContent="center">
                      <Pagination 
                        count={totalPages} 
                        page={page} 
                        onChange={handlePageChange}
                        color="primary" 
                        showFirstButton 
                        showLastButton
                      />
                    </Stack>
                  </>
                )}
              </>
            ) : (
              /* No Jobs State */
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No jobs found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search criteria or filters
                </Typography>
                {/* Debug Info */}
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Debug: Jobs state: {JSON.stringify({ jobsLength: jobs.length, totalJobs, page, loading })}
                  </Typography>
                </Box>
              </Paper>
            )}
          </Stack>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Quick Filters</Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <TextField 
                  size="small" 
                  select 
                  fullWidth 
                  label="Experience" 
                  value={exp} 
                  onChange={(e) => { setExp(e.target.value); handleFilterChange(); }}
                >
                  {['Fresher','0–2 yrs','2–5 yrs','5+ yrs'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  size="small" 
                  select 
                  fullWidth 
                  label="Job Type" 
                  value={jobType} 
                  onChange={(e) => { setJobType(e.target.value); handleFilterChange(); }}
                >
                  {['Full-time','Part-time','Contract','Internship','Remote'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  size="small" 
                  select 
                  fullWidth 
                  label="Industry" 
                  value={industry} 
                  onChange={(e) => { setIndustry(e.target.value); handleFilterChange(); }}
                >
                  {['IT','Finance','Marketing','Healthcare','Education'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  size="small" 
                  select 
                  fullWidth 
                  label="Posted" 
                  value={posted} 
                  onChange={(e) => { setPosted(e.target.value); handleFilterChange(); }}
                >
                  {['Last 24 hrs','Last 7 days','Last 30 days'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  size="small" 
                  fullWidth 
                  label="Min Salary" 
                  value={salaryMin} 
                  onChange={(e) => setSalaryMin(e.target.value)}
                  onBlur={handleFilterChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField 
                  size="small" 
                  fullWidth 
                  label="Max Salary" 
                  value={salaryMax} 
                  onChange={(e) => setSalaryMax(e.target.value)}
                  onBlur={handleFilterChange}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h5" sx={{ color: 'primary.main' }}>
            {selected?.job_title || selected?.title}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {/* Company and Location */}
            <Box>
              <Typography variant="h6" color="text.secondary">
                {selected?.company_name || selected?.company}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                📍 {selected?.city || 'Location not specified'}
                {selected?.state && `, ${selected?.state}`}
                {selected?.country && `, ${selected?.country}`}
              </Typography>
            </Box>

            {/* Job Details */}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Employment Type</Typography>
                <Typography variant="body1">
                  {selected?.employment_type ? selected.employment_type.replace('_', ' ') : 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Work Mode</Typography>
                <Typography variant="body1">
                  {selected?.work_mode ? selected.work_mode.replace('_', ' ') : 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Experience Required</Typography>
                <Typography variant="body1">
                  {selected?.experience_required || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Education</Typography>
                <Typography variant="body1">
                  {selected?.education_required || 'Not specified'}
                </Typography>
              </Grid>
            </Grid>

            {/* Salary */}
            {selected?.salary_min || selected?.salary_max ? (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Salary Range</Typography>
                <Typography variant="body1">
                  {selected?.salary_min && selected?.salary_max 
                    ? `₹${selected.salary_min.toLocaleString()} - ₹${selected.salary_max.toLocaleString()} ${selected.salary_type || 'per month'}`
                    : selected?.salary_min 
                      ? `₹${selected.salary_min.toLocaleString()}+ ${selected.salary_type || 'per month'}`
                      : `Up to ₹${selected.salary_max.toLocaleString()} ${selected.salary_type || 'per month'}`
                  }
                </Typography>
              </Box>
            ) : null}

            {/* Skills */}
            {selected?.skills_required && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Required Skills</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                  {selected.skills_required.split(',').map((skill, index) => (
                    <Chip key={index} label={skill.trim()} size="small" color="primary" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Job Summary */}
            {selected?.job_summary && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Job Summary</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {selected.job_summary}
                </Typography>
              </Box>
            )}

            {/* Roles & Responsibilities */}
            {selected?.roles_responsibilities && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Roles & Responsibilities</Typography>
                <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                  {selected.roles_responsibilities}
                </Typography>
              </Box>
            )}

            {/* Key Requirements */}
            {selected?.key_requirements && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Key Requirements</Typography>
                <Typography variant="body1" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                  {selected.key_requirements}
                </Typography>
              </Box>
            )}

            {/* Application Details */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Application Details</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                • How to Apply: {selected?.how_to_apply ? selected.how_to_apply.replace('_', ' ') : 'Not specified'}<br/>
                • Number of Openings: {selected?.number_of_openings || 'Not specified'}<br/>
                {selected?.application_deadline && `• Deadline: ${new Date(selected.application_deadline).toLocaleDateString()}`}
              </Typography>
            </Box>

            {/* Posted Date */}
            <Typography variant="caption" color="text.secondary">
              Posted on {selected?.created_at ? new Date(selected.created_at).toLocaleDateString() : 'Recently'}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close</Button>
          <Button variant="contained">Apply Now</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Filters</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField size="small" select fullWidth label="Experience Level" value={exp} onChange={(e) => setExp(e.target.value)}>
              {['Fresher','0–2 yrs','2–5 yrs','5+ yrs'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
            </TextField>
            <TextField size="small" select fullWidth label="Job Type" value={jobType} onChange={(e) => setJobType(e.target.value)}>
              {['Full-time','Part-time','Contract','Internship','Remote'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
            </TextField>
            <TextField size="small" fullWidth label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Stack direction="row" spacing={1}>
              <TextField size="small" fullWidth label="Min Salary" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} />
              <TextField size="small" fullWidth label="Max Salary" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} />
            </Stack>
            <TextField size="small" select fullWidth label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)}>
              {['IT','Finance','Marketing','Healthcare','Education'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
            </TextField>
            <TextField size="small" select fullWidth label="Posted" value={posted} onChange={(e) => setPosted(e.target.value)}>
              {['Last 24 hrs','Last 7 days','Last 30 days'].map((x) => <MenuItem key={x} value={x}>{x}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFiltersOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => { setFiltersOpen(false); handleFilterChange(); }}>Apply Filters</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


