import React from 'react';
import { Box, Button, Chip, Divider, Grid, LinearProgress, MenuItem, Paper, Stack, TextField, Typography, Avatar, Alert } from '@mui/material';
import { saveProfile, getProfile } from '../api/users';

export default function Profile() {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [headline, setHeadline] = React.useState('');
  const [jobTitle, setJobTitle] = React.useState('');
  const [company, setCompany] = React.useState('');
  const [country, setCountry] = React.useState('');
  const [state, setState] = React.useState('');
  const [city, setCity] = React.useState('');
  const [educations, setEducations] = React.useState([]);
  const [projects, setProjects] = React.useState([]);
  const [skills, setSkills] = React.useState([]);
  const [skillInput, setSkillInput] = React.useState('');
  const [resumeUrl, setResumeUrl] = React.useState('');
  const [coverLetterUrl, setCoverLetterUrl] = React.useState('');

  // Form states for adding new entries
  const [newEducation, setNewEducation] = React.useState({
    degree_qualification: '',
    institution: '',
    field_of_study: '',
    start_year: '',
    end_year: ''
  });
  const [newProject, setNewProject] = React.useState({
    project_title: '',
    live_github_link: '',
    description: ''
  });
  const [editMode, setEditMode] = React.useState(true);
  const [preferredTitles, setPreferredTitles] = React.useState([]);
  const [titleInput, setTitleInput] = React.useState('');
  const [jobLocations, setJobLocations] = React.useState('');
  const [employmentType, setEmploymentType] = React.useState('');
  const [expectedCtc, setExpectedCtc] = React.useState('');
  const [noticePeriod, setNoticePeriod] = React.useState('');

  // New states for loading and error
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [loadingProfile, setLoadingProfile] = React.useState(true);

  // Function to load profile data
  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const profileData = await getProfile();

      // The API returns data in { user: {...}, profile: {...} } format
      const profile = profileData.profile || {};

      // Populate basic information
      setFullName(profile.full_name || '');
      setEmail(profile.email || '');
      setHeadline(profile.headline || '');
      setJobTitle(profile.current_job_title || '');
      setCompany(profile.company || '');
      setCountry(profile.country || '');
      setState(profile.state || '');
      setCity(profile.city || '');

      // Populate job preferences
      if (profile.job_preferences) {
        if (profile.job_preferences.preferred_job_title) {
          setPreferredTitles(profile.job_preferences.preferred_job_title.split(', '));
        }
        setJobLocations(profile.job_preferences.job_location_preferences || '');
        setEmploymentType(profile.job_preferences.employment_type || '');
        setExpectedCtc(profile.job_preferences.expected_salary_ctc || '');
        setNoticePeriod(profile.job_preferences.notice_period || '');
      }

      // Populate arrays
      setEducations(profile.education || []);
      setSkills(profile.skills || []);
      setProjects(profile.projects || []);

      // Populate URLs
      setResumeUrl(profile.resume_url || '');
      setCoverLetterUrl(profile.cover_letter_url || '');

    } catch (e) {
      console.error('Failed to load profile:', e);
      // If profile doesn't exist, just use default empty values
      // Load basic info from localStorage as fallback
      try {
        setFullName(localStorage.getItem('full_name') || '');
        setEmail(localStorage.getItem('username') || '');
      } catch (e) {}
    } finally {
      setLoadingProfile(false);
    }
  };

  // Load existing profile data on component mount
  React.useEffect(() => {
    loadProfile();
  }, []);

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    setSkills((prev) => Array.from(new Set([...prev, s])));
    setSkillInput('');
  };

  const removeSkill = (s) => setSkills((prev) => prev.filter((x) => x !== s));

  // Function to handle Save Changes click
  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Build job preferences object
      const job_preferences = {};
      if (preferredTitles.length > 0) {
        job_preferences.preferred_job_title = preferredTitles.join(', ');
      }
      if (jobLocations.trim()) {
        job_preferences.job_location_preferences = jobLocations.trim();
      }
      if (employmentType.trim()) {
        job_preferences.employment_type = employmentType.trim();
      }
      if (expectedCtc.trim()) {
        job_preferences.expected_salary_ctc = expectedCtc.trim();
      }
      if (noticePeriod.trim()) {
        job_preferences.notice_period = noticePeriod.trim();
      }

      const profileData = {
        full_name: fullName.trim(),
        email: email.trim(),
        headline: headline.trim() || undefined,
        current_job_title: jobTitle.trim() || undefined,
        company: company.trim() || undefined,
        country: country.trim() || undefined,
        state: state.trim() || undefined,
        city: city.trim() || undefined,
        job_preferences: Object.keys(job_preferences).length > 0 ? job_preferences : undefined,
        education: educations.length > 0 ? educations : undefined,
        skills: skills.length > 0 ? skills : undefined,
        projects: projects.length > 0 ? projects : undefined,
        resume_url: resumeUrl.trim() || undefined,
        cover_letter_url: coverLetterUrl.trim() || undefined
      };

      // Remove undefined values from main object
      Object.keys(profileData).forEach(key => {
        if (profileData[key] === undefined || (Array.isArray(profileData[key]) && profileData[key].length === 0) || (typeof profileData[key] === 'object' && profileData[key] !== null && Object.keys(profileData[key]).length === 0)) {
          delete profileData[key];
        }
      });

      console.log('Sending profile data:', profileData); // Debug log
      await saveProfile(profileData);
      setSuccess('Profile saved successfully.');
      // Re-fetch profile data to update the display
      await loadProfile();
    } catch (e) {
      console.error('Save profile error:', e); // Debug log
      setError(e.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const completion = React.useMemo(() => {
    let total = 0; let filled = 0;
    const fields = [fullName, headline, jobTitle, company, country, state, city];
    total += fields.length;
    filled += fields.filter(Boolean).length;
    total += 1; if (educations.length > 0) filled += 1;
    total += 1; if (skills.length > 0) filled += 1;
    total += 1; if (projects.length > 0) filled += 1;
    total += 1; if (resumeUrl) filled += 1;
    return Math.round((filled / total) * 100);
  }, [fullName, headline, jobTitle, company, country, state, city, educations, skills, projects, resumeUrl]);

  if (loadingProfile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ width: 56, height: 56 }}>{(fullName || email || 'U').charAt(0).toUpperCase()}</Avatar>
          <Box>
            <Typography variant="h5">{fullName || 'Your Name'}</Typography>
            <Typography variant="body2" color="text.secondary">{headline || 'Add a headline'}</Typography>
          </Box>
        </Stack>
        <Box sx={{ minWidth: 220 }}>
          <Typography variant="body2" color="text.secondary">Profile completeness</Typography>
          <LinearProgress variant="determinate" value={completion} sx={{ height: 8, borderRadius: 999, mt: 0.5 }} />
          <Typography variant="caption" color="text.secondary">{completion}% completed</Typography>
        </Box>
      </Stack>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Basic Information</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} /></Grid>
          <Grid item xs={12}><TextField fullWidth label="Headline / Tagline" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Software Engineer | Python | Django | React" /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Current job title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Company" value={company} onChange={(e) => setCompany(e.target.value)} /></Grid>
          <Grid item xs={12} sm={4}><TextField select fullWidth label="Country" value={country} onChange={(e) => setCountry(e.target.value)}>
            {['India','USA','UK','Canada','Germany','Australia'].map((c) => (<MenuItem key={c} value={c}>{c}</MenuItem>))}
          </TextField></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth label="State" value={state} onChange={(e) => setState(e.target.value)} /></Grid>
          <Grid item xs={12} sm={4}><TextField fullWidth label="City" value={city} onChange={(e) => setCity(e.target.value)} /></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="h6">Job Preferences</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="text" onClick={() => setEditMode((v) => !v)}>{editMode ? 'View' : 'Edit'}</Button>
            <Button variant="contained" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </Stack>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 1 }}>
              <TextField disabled={!editMode} fullWidth label="Add preferred job title" value={titleInput} onChange={(e) => setTitleInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' ? setPreferredTitles((p)=> Array.from(new Set([...p, titleInput.trim()])).filter(Boolean)) || setTitleInput('') : null} />
              <Button disabled={!editMode} variant="outlined" onClick={() => { const t = titleInput.trim(); if (!t) return; setPreferredTitles((p) => Array.from(new Set([...p, t]))); setTitleInput(''); }}>Add</Button>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {preferredTitles.map((t) => <Chip key={t} label={t} onDelete={editMode ? () => setPreferredTitles((p)=> p.filter((x)=> x!==t)) : undefined} />)}
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <TextField disabled={!editMode} fullWidth label="Job location preferences" placeholder="e.g., Remote, Pune, Bangalore" value={jobLocations} onChange={(e) => setJobLocations(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField disabled={!editMode} select fullWidth label="Employment type" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
              {['Full-time','Part-time','Remote','Hybrid','Contract','Internship'].map((t) => (<MenuItem key={t} value={t}>{t}</MenuItem>))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField disabled={!editMode} fullWidth label="Expected salary / CTC" placeholder="Optional" value={expectedCtc} onChange={(e) => setExpectedCtc(e.target.value)} />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField disabled={!editMode} select fullWidth label="Notice period" value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)}>
              {['Immediate','15 days','30 days','45 days','60 days','90 days'].map((n) => (<MenuItem key={n} value={n}>{n}</MenuItem>))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Education</Typography>
          <Button variant="outlined" onClick={() => {
            if (newEducation.degree_qualification.trim() && newEducation.institution.trim()) {
              setEducations(prev => [...prev, { ...newEducation, start_year: newEducation.start_year ? parseInt(newEducation.start_year) : undefined, end_year: newEducation.end_year ? parseInt(newEducation.end_year) : undefined }]);
              setNewEducation({ degree_qualification: '', institution: '', field_of_study: '', start_year: '', end_year: '' });
            }
          }}>Add Education</Button>
        </Stack>

        {/* Display existing educations */}
        {educations.map((edu, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">{edu.degree_qualification}</Typography>
                <Typography variant="body2" color="text.secondary">{edu.institution}</Typography>
                {edu.field_of_study && <Typography variant="body2">{edu.field_of_study}</Typography>}
                {(edu.start_year || edu.end_year) && (
                  <Typography variant="body2" color="text.secondary">
                    {edu.start_year || 'N/A'} - {edu.end_year || 'Present'}
                  </Typography>
                )}
              </Box>
              <Button size="small" color="error" onClick={() => setEducations(prev => prev.filter((_, i) => i !== index))}>Remove</Button>
            </Stack>
          </Paper>
        ))}

        {/* Add new education form */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Degree / Qualification" value={newEducation.degree_qualification} onChange={(e) => setNewEducation(prev => ({ ...prev, degree_qualification: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Institution" value={newEducation.institution} onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Field of study" value={newEducation.field_of_study} onChange={(e) => setNewEducation(prev => ({ ...prev, field_of_study: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={3}><TextField select fullWidth label="Start year" value={newEducation.start_year} onChange={(e) => setNewEducation(prev => ({ ...prev, start_year: e.target.value }))} >
            {Array.from({ length: 50 }).map((_, i) => {
              const y = String(new Date().getFullYear() - i);
              return <MenuItem key={y} value={y}>{y}</MenuItem>;
            })}
          </TextField></Grid>
          <Grid item xs={12} sm={3}><TextField select fullWidth label="End year" value={newEducation.end_year} onChange={(e) => setNewEducation(prev => ({ ...prev, end_year: e.target.value }))} >
            {Array.from({ length: 55 }).map((_, i) => {
              const y = String(new Date().getFullYear() + 5 - i);
              return <MenuItem key={y} value={y}>{y}</MenuItem>;
            })}
          </TextField></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Skills</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 1 }}>
          <TextField fullWidth label="Add a skill" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' ? addSkill() : null} />
          <Button variant="outlined" onClick={addSkill}>Add</Button>
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {skills.map((s) => <Chip key={s} label={s} onDelete={() => removeSkill(s)} />)}
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6">Projects / Portfolio</Typography>
          <Button variant="outlined" onClick={() => {
            if (newProject.project_title.trim()) {
              setProjects(prev => [...prev, { ...newProject }]);
              setNewProject({ project_title: '', live_github_link: '', description: '' });
            }
          }}>Add Project</Button>
        </Stack>

        {/* Display existing projects */}
        {projects.map((proj, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">{proj.project_title}</Typography>
                {proj.live_github_link && (
                  <Typography variant="body2" color="primary" sx={{ textDecoration: 'underline' }}>
                    {proj.live_github_link}
                  </Typography>
                )}
                {proj.description && <Typography variant="body2">{proj.description}</Typography>}
              </Box>
              <Button size="small" color="error" onClick={() => setProjects(prev => prev.filter((_, i) => i !== index))}>Remove</Button>
            </Stack>
          </Paper>
        ))}

        {/* Add new project form */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Project title" value={newProject.project_title} onChange={(e) => setNewProject(prev => ({ ...prev, project_title: e.target.value }))} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Live/GitHub link" value={newProject.live_github_link} onChange={(e) => setNewProject(prev => ({ ...prev, live_github_link: e.target.value }))} /></Grid>
          <Grid item xs={12}><TextField fullWidth multiline minRows={3} label="Description (problem solved, tech stack used)" value={newProject.description} onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))} /></Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Resume & Documents</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Resume URL" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} placeholder="https://example.com/resume.pdf" /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Cover Letter URL" value={coverLetterUrl} onChange={(e) => setCoverLetterUrl(e.target.value)} placeholder="https://example.com/coverletter.pdf" /></Grid>
        </Grid>
      </Paper>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </Stack>
    </Box>
  );
}
