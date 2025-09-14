# Post Job API - Backend Implementation Guide

## Overview
This document outlines the API endpoints required for the Job Portal's "Post Job" functionality.

## Base URL
```
http://localhost:8000/api/v1/jobs/
```

## Authentication
All endpoints require a valid Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## 1. Create Job (POST)

### Endpoint
```
POST /api/v1/jobs/
```

### Request Body
```json
{
  "job_title": "Software Engineer",
  "company_name": "Tech Corp",
  "industry": "IT",
  "employment_type": "full-time",
  "work_mode": "on-site",
  "city": "Mumbai",
  "state": "Maharashtra",
  "country": "India",
  "experience_required": "2-5 years",
  "education_required": "Bachelor's",
  "skills_required": ["Python", "Django", "React"],
  "salary_type": "monthly",
  "salary_min": 50000,
  "salary_max": 80000,
  "job_summary": "We are looking for a skilled software engineer...",
  "roles_responsibilities": ["Develop applications", "Collaborate with teams"],
  "key_requirements": ["Strong problem-solving skills", "Good communication"],
  "application_deadline": "2024-12-31",
  "how_to_apply": "quick_apply",
  "number_of_openings": 3,
  "hiring_manager": "John Doe",
  "recruiter_contact": {"email": "hr@example.com", "phone": "+91 9876543210"},
  "job_status": "active",
  "visibility": "public",
  "tags": ["Urgent Hiring", "Work From Home"]
}
```

---

## 2. Get All Jobs (GET)

### Endpoint
```
GET /api/v1/jobs/
```

### Query Parameters
```
?page=1&search=software&location=mumbai&experience=fresher&job_type=full-time
```

---

## 3. Get Job by ID (GET)

### Endpoint
```
GET /api/v1/jobs/{job_id}/
```

---

## 4. Update Job (PUT/PATCH)

### Endpoint
```
PUT /api/v1/jobs/{job_id}/
PATCH /api/v1/jobs/{job_id}/
```

---

## 5. Delete Job (DELETE)

### Endpoint
```
DELETE /api/v1/jobs/{job_id}/
```

---

## 6. Get My Jobs (GET)

### Endpoint
```
GET /api/v1/jobs/my-jobs/
```

---

## Data Model

### Job Model Fields
- job_title, company_name, industry
- employment_type, work_mode, location details
- experience_required, education_required, skills_required
- salary details, perks_benefits
- job_summary, roles_responsibilities, key_requirements
- application details, hiring manager info
- job_status, visibility, tags
- metadata (posted_by, dates, counts)

### Required Validations
- Only admin users can create/edit/delete jobs
- Check job ownership before updates/deletes
- Validate all required fields
- Implement proper error handling

### Implementation Notes
- Use Django REST Framework
- Implement search and filtering
- Add pagination for list endpoints
- Track job views and applications
- Send notifications for job updates
