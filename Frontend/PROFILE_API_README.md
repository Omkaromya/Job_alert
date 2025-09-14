# Profile API Documentation

This document describes the POST API endpoint to create/save a user profile.

## Endpoint

`POST /profile`

## Description

This API accepts user profile information including basic details, job preferences, education, skills, projects, and documents. The data is sent as JSON in the request body.

## Request Body Schema

```json
{
  "full_name": "string (required)",
  "email": "string (email format, required)",
  "headline": "string (optional)",
  "current_job_title": "string (optional)",
  "company": "string (optional)",
  "country": "string (optional)",
  "state": "string (optional)",
  "city": "string (optional)",
  "job_preferences": {
    "preferred_job_title": "string (optional)",
    "job_location_preferences": "string (optional)",
    "employment_type": "string (optional)",
    "expected_salary_ctc": "string (optional)",
    "notice_period": "string (optional)"
  },
  "education": [
    {
      "degree_qualification": "string (optional)",
      "institution": "string (optional)",
      "field_of_study": "string (optional)",
      "start_year": "integer (optional)",
      "end_year": "integer (optional)"
    }
  ],
  "skills": ["string", "..."],
  "projects": [
    {
      "project_title": "string (optional)",
      "live_github_link": "string (URL, optional)",
      "description": "string (optional)"
    }
  ],
  "resume_url": "string (URL, optional)",
  "cover_letter_url": "string (URL, optional)"
}
```

## Example Request

```json
{
  "full_name": "Avikanjalkar335",
  "email": "avikanjalkar335@gmail.com",
  "headline": "Software Engineer | Python | Django | React",
  "current_job_title": "Software Engineer",
  "company": "Example Company",
  "country": "India",
  "state": "Maharashtra",
  "city": "Pune",
  "job_preferences": {
    "preferred_job_title": "Senior Software Engineer",
    "job_location_preferences": "Remote, Pune",
    "employment_type": "Full-time",
    "expected_salary_ctc": "15 LPA",
    "notice_period": "1 Month"
  },
  "education": [
    {
      "degree_qualification": "Bachelor of Engineering",
      "institution": "Example University",
      "field_of_study": "Computer Science",
      "start_year": 2015,
      "end_year": 2019
    }
  ],
  "skills": ["Python", "Django", "React"],
  "projects": [
    {
      "project_title": "Job Portal",
      "live_github_link": "https://github.com/avikanjalkar335/job-portal",
      "description": "Developed a job portal using Django and React."
    }
  ],
  "resume_url": "https://example.com/resume.pdf",
  "cover_letter_url": "https://example.com/coverletter.pdf"
}
```

## Example Response

```json
{
  "message": "Profile saved successfully",
  "profile": {
    "full_name": "Avikanjalkar335",
    "email": "avikanjalkar335@gmail.com",
    "headline": "Software Engineer | Python | Django | React",
    "current_job_title": "Software Engineer",
    "company": "Example Company",
    "country": "India",
    "state": "Maharashtra",
    "city": "Pune",
    "job_preferences": {
      "preferred_job_title": "Senior Software Engineer",
      "job_location_preferences": "Remote, Pune",
      "employment_type": "Full-time",
      "expected_salary_ctc": "15 LPA",
      "notice_period": "1 Month"
    },
    "education": [
      {
        "degree_qualification": "Bachelor of Engineering",
        "institution": "Example University",
        "field_of_study": "Computer Science",
        "start_year": 2015,
        "end_year": 2019
      }
    ],
    "skills": ["Python", "Django", "React"],
    "projects": [
      {
        "project_title": "Job Portal",
        "live_github_link": "https://github.com/avikanjalkar335/job-portal",
        "description": "Developed a job portal using Django and React."
      }
    ],
    "resume_url": "https://example.com/resume.pdf",
    "cover_letter_url": "https://example.com/coverletter.pdf"
  }
}
```

## Notes

- The backend team should implement this API using FastAPI or the chosen framework.
- The API should validate the input data and save it to the database.
- The URLs for resume and cover letter can be file upload URLs or external links.
- The response should confirm successful saving of the profile data.
