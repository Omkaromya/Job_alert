# Candidate Profile API Documentation (Manual Data Entry)

## Overview
This document outlines the backend API endpoints for managing candidate profiles in the job portal application. The API focuses on manual data entry for profile information, with the following workflow:
1. Use POST method to save all profile fields in the database
2. Use GET method to retrieve and display the profile
3. Use PUT method to update existing profile data

## Base URL
```
/api/v1
```

## Authentication
All endpoints require Bearer token authentication in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### 1. Create/Save Candidate Profile
**Endpoint:** `POST /app/profile`

**Description:** Creates or saves the candidate's profile with all manually entered fields in the database.

**Request:**
- Method: POST
- Headers: Authorization (Bearer token), Content-Type: application/json
- Body:
```json
{
  "full_name": "string",
  "mobile_number": "string",
  "location": "string",
  "skills": ["string"],
  "experience_years": "number",
  "education": "string",
  "bio": "string"
}
```

**Response:**
- Status: 201 Created (for new profile) or 200 OK (for existing profile update)
- Body:
```json
{
  "message": "Profile saved successfully",
  "profile": {
    "id": "string",
    "full_name": "string",
    "email": "string",
    "mobile_number": "string",
    "location": "string",
    "skills": ["string"],
    "experience_years": "number",
    "education": "string",
    "bio": "string",
    "is_active": "boolean",
    "created_at": "string",
    "updated_at": "string"
  }
}
```

**Error Responses:**
- 400 Bad Request: Invalid input data
- 401 Unauthorized: Invalid or missing token
- 500 Internal Server Error: Server error

### 2. Get Candidate Profile
**Endpoint:** `GET /app/profile`

**Description:** Retrieves the current authenticated candidate's profile information for display.

**Request:**
- Method: GET
- Headers: Authorization (Bearer token)

**Response:**
- Status: 200 OK
- Body:
```json
{
  "id": "string",
  "full_name": "string",
  "email": "string",
  "mobile_number": "string",
  "location": "string",
  "skills": ["string"],
  "experience_years": "number",
  "education": "string",
  "bio": "string",
  "is_active": "boolean",
  "created_at": "string",
  "updated_at": "string"
}
```

**Error Responses:**
- 401 Unauthorized: Invalid or missing token
- 404 Not Found: Profile not found
- 500 Internal Server Error: Server error

### 3. Update Candidate Profile
**Endpoint:** `PUT /app/profile`

**Description:** Updates the existing candidate's profile information with manually entered data.

**Request:**
- Method: PUT
- Headers: Authorization (Bearer token), Content-Type: application/json
- Body:
```json
{
  "full_name": "string",
  "mobile_number": "string",
  "location": "string",
  "skills": ["string"],
  "experience_years": "number",
  "education": "string",
  "bio": "string"
}
```

**Response:**
- Status: 200 OK
- Body:
```json
{
  "message": "Profile updated successfully",
  "profile": {
    "id": "string",
    "full_name": "string",
    "email": "string",
    "mobile_number": "string",
    "location": "string",
    "skills": ["string"],
    "experience_years": "number",
    "education": "string",
    "bio": "string",
    "is_active": "boolean",
    "updated_at": "string"
  }
}
```

**Error Responses:**
- 400 Bad Request: Invalid input data
- 401 Unauthorized: Invalid or missing token
- 404 Not Found: Profile not found
- 500 Internal Server Error: Server error

## Data Models

### Profile Object
```json
{
  "id": "string (UUID)",
  "full_name": "string (required, 2-100 characters)",
  "email": "string (required, valid email format)",
  "mobile_number": "string (optional, valid phone number)",
  "location": "string (optional, 2-100 characters)",
  "skills": ["string"] (optional, array of skill names, 1-50 chars each, max 20 skills),
  "experience_years": "number (optional, 0-50)",
  "education": "string (optional, 10-500 characters)",
  "bio": "string (optional, 10-1000 characters)",
  "is_active": "boolean",
  "created_at": "string (ISO 8601 datetime)",
  "updated_at": "string (ISO 8601 datetime)"
}
```

## Validation Rules

### Profile Creation/Update Validation
- **full_name**: Required, 2-100 characters, alphabetic characters and spaces only
- **email**: Required, valid email format (automatically set from authenticated user)
- **mobile_number**: Optional, valid phone number format (10-15 digits, may include + and spaces)
- **location**: Optional, 2-100 characters
- **skills**: Optional, array of strings (1-50 characters each), maximum 20 skills
- **experience_years**: Optional, integer between 0 and 50
- **education**: Optional, 10-500 characters
- **bio**: Optional, 10-1000 characters

## Workflow
1. **Initial Save**: Use POST /app/profile to save all profile fields for the first time
2. **Display**: Use GET /app/profile to retrieve and display the saved profile
3. **Updates**: Use PUT /app/profile to modify existing profile data

## Error Handling

All endpoints return errors in the following format:
```json
{
  "error": "string",
  "message": "string",
  "details": {
    "field": "string",
    "issue": "string"
  }
}
```

## Rate Limiting
- Profile endpoints: 100 requests per hour per user

## Security Considerations
- All endpoints require authentication
- Input sanitization to prevent XSS attacks
- SQL injection prevention through parameterized queries
- CORS configured for frontend domain only

## Implementation Notes
- Use JWT tokens for authentication
- Implement proper logging for audit trails
- Use database transactions for data consistency
- Validate all input data on both client and server side
- Return detailed validation errors for better user experience
- POST method should handle both creation and update if profile already exists
