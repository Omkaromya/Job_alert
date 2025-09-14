# Job Posting API Documentation

## Overview
This document outlines the complete Job Posting API system based on the POST_JOB_API_README requirements.

## Base URL
```
http://127.0.0.1:8000/api/v1/jobs
```

## Authentication
All endpoints require a valid Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## 🔐 **API Endpoints**

### **1. Create Job (POST)**
**Endpoint:** `POST /api/v1/jobs/`  
**Authentication:** Required (Employer role)  
**Status Code:** 201 Created

**Request Body:**
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
  "skills_required": "Python, Django, React, SQL",
  "salary_type": "monthly",
  "salary_min": 50000,
  "salary_max": 80000,
  "job_summary": "We are looking for a skilled software engineer...",
  "roles_responsibilities": "Develop applications, Collaborate with teams, Code review",
  "key_requirements": "Strong problem-solving skills, Good communication, Team player",
  "application_deadline": "2024-12-31T23:59:59",
  "how_to_apply": "quick_apply",
  "number_of_openings": 3,
  "hiring_manager": "John Doe",
  "recruiter_contact": "hr@example.com, +91 9876543210",
  "job_status": "active",
  "visibility": "public",
  "tags": "Urgent Hiring, Work From Home, Growth Opportunity"
}
```

**Response:**
```json
{
  "id": 1,
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
  "skills_required": "Python, Django, React, SQL",
  "salary_type": "monthly",
  "salary_min": 50000,
  "salary_max": 80000,
  "job_summary": "We are looking for a skilled software engineer...",
  "roles_responsibilities": "Develop applications, Collaborate with teams, Code review",
  "key_requirements": "Strong problem-solving skills, Good communication, Team player",
  "application_deadline": "2024-12-31T23:59:59",
  "how_to_apply": "quick_apply",
  "number_of_openings": 3,
  "hiring_manager": "John Doe",
  "recruiter_contact": "hr@example.com, +91 9876543210",
  "job_status": "active",
  "visibility": "public",
  "tags": "Urgent Hiring, Work From Home, Growth Opportunity",
  "posted_by": 1,
  "is_active": true,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": null
}
```

---

### **2. Get All Jobs (GET)**
**Endpoint:** `GET /api/v1/jobs/`  
**Authentication:** Not required  
**Status Code:** 200 OK

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `size` (int): Page size (default: 10, max: 100)
- `search` (string): Search keywords
- `location` (string): Job location (city/state/country)
- `experience` (string): Experience level
- `job_type` (string): Employment type
- `work_mode` (string): Work mode
- `industry` (string): Industry
- `salary_min` (float): Minimum salary
- `salary_max` (float): Maximum salary

**Example Request:**
```
GET /api/v1/jobs/?page=1&size=10&search=software&location=mumbai&experience=fresher&job_type=full-time
```

---

### **3. Get Job by ID (GET)**
**Endpoint:** `GET /api/v1/jobs/{job_id}`  
**Authentication:** Not required  
**Status Code:** 200 OK

**Example Request:**
```
GET /api/v1/jobs/1
```

---

### **4. Update Job (PUT)**
**Endpoint:** `PUT /api/v1/jobs/{job_id}`  
**Authentication:** Required (Job poster or Admin)  
**Status Code:** 200 OK

**Request Body:** Same as JobCreate but all fields are optional

**Example Request:**
```json
{
  "salary_max": 90000,
  "number_of_openings": 5,
  "tags": "Urgent Hiring, Work From Home, Growth Opportunity, Remote Friendly"
}
```

---

### **5. Delete Job (DELETE)**
**Endpoint:** `DELETE /api/v1/jobs/{job_id}`  
**Authentication:** Required (Job poster or Admin)  
**Status Code:** 200 OK

**Note:** This is a soft delete - sets `is_active` to `false`

---

### **6. Get My Jobs (GET)**
**Endpoint:** `GET /api/v1/jobs/my-jobs/`  
**Authentication:** Required (Employer role)  
**Status Code:** 200 OK

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `size` (int): Page size (default: 10, max: 100)

---

### **7. Admin Dashboard (GET)**
**Endpoint:** `GET /api/v1/jobs/admin/dashboard`  
**Authentication:** Required (Admin role)  
**Status Code:** 200 OK

**Response:**
```json
{
  "message": "Welcome to Admin Dashboard",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "admin",
    "is_superuser": true
  },
  "dashboard_data": {
    "total_jobs": 150,
    "active_jobs": 120,
    "inactive_jobs": 30
  }
}
```

---

## 📊 **Data Model**

### **Job Model Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `job_title` | String | ✅ | Job title |
| `company_name` | String | ✅ | Company name |
| `industry` | String | ❌ | Industry |
| `employment_type` | String | ❌ | full-time, part-time, contract, internship |
| `work_mode` | String | ❌ | on-site, remote, hybrid |
| `city` | String | ❌ | City |
| `state` | String | ❌ | State |
| `country` | String | ❌ | Country |
| `experience_required` | String | ❌ | Experience level |
| `education_required` | String | ❌ | Education requirement |
| `skills_required` | String | ❌ | Comma-separated skills |
| `salary_type` | String | ❌ | monthly, yearly, hourly |
| `salary_min` | Float | ❌ | Minimum salary |
| `salary_max` | Float | ❌ | Maximum salary |
| `job_summary` | Text | ❌ | Job summary |
| `roles_responsibilities` | Text | ❌ | Comma-separated roles |
| `key_requirements` | Text | ❌ | Comma-separated requirements |
| `application_deadline` | DateTime | ❌ | Application deadline |
| `how_to_apply` | String | ❌ | quick_apply, email, website |
| `number_of_openings` | Integer | ❌ | Number of openings |
| `hiring_manager` | String | ❌ | Hiring manager name |
| `recruiter_contact` | String | ❌ | Contact information |
| `job_status` | String | ❌ | active, inactive, draft, closed |
| `visibility` | String | ❌ | public, private, company_only |
| `tags` | String | ❌ | Comma-separated tags |

---

## 🔒 **Security & Authorization**

### **Role-Based Access Control**
- **Employer Role:** Can create, update, delete their own jobs
- **Admin Role:** Can manage all jobs
- **Regular Users:** Can only view jobs

### **Job Ownership**
- Users can only edit/delete jobs they posted
- Admins can edit/delete any job
- Soft delete implementation (jobs are marked inactive, not removed)

---

## 🧪 **Testing in Postman**

### **1. Create Job (Employer)**
```http
POST http://127.0.0.1:8000/api/v1/jobs
Authorization: Bearer YOUR_EMPLOYER_TOKEN
Content-Type: application/json

{
  "job_title": "Frontend Developer",
  "company_name": "Web Solutions Inc",
  "industry": "Technology",
  "employment_type": "full-time",
  "work_mode": "remote",
  "city": "Bangalore",
  "state": "Karnataka",
  "country": "India",
  "experience_required": "1-3 years",
  "skills_required": "React, JavaScript, HTML, CSS",
  "salary_type": "monthly",
  "salary_min": 40000,
  "salary_max": 60000,
  "job_summary": "Looking for a skilled frontend developer...",
  "number_of_openings": 2
}
```

### **2. Get All Jobs**
```http
GET http://127.0.0.1:8000/api/v1/jobs?page=1&size=10&search=developer&location=bangalore
```

### **3. Update Job**
```http
PUT http://127.0.0.1:8000/api/v1/jobs1
Authorization: Bearer YOUR_EMPLOYER_TOKEN
Content-Type: application/json

{
  "salary_max": 70000,
  "number_of_openings": 3
}
```

### **4. Get My Jobs**
```http
GET http://127.0.0.1:8000/api/v1/jobsmy-jobs/?page=1&size=10
Authorization: Bearer YOUR_EMPLOYER_TOKEN
```

---

## ⚠️ **Important Notes**

1. **Database Migration:** Run `alembic upgrade head` after model changes
2. **Role Requirements:** Ensure users have proper roles (employer, admin)
3. **Data Validation:** All required fields must be provided
4. **Soft Delete:** Jobs are marked inactive, not permanently deleted
5. **Search & Filtering:** Built-in search across job title, company, summary, skills
6. **Pagination:** All list endpoints support pagination

---

## 🚀 **Quick Start**

1. **Start your FastAPI server**
2. **Ensure database is migrated** (`alembic upgrade head`)
3. **Login as employer** to get access token
4. **Create a job** using the POST endpoint
5. **Test other endpoints** as needed

The API is now fully compliant with the POST_JOB_API_README requirements! 🎯
