# Role Checking API Documentation

This document explains the role checking APIs that have been added to the backend.

## Available Roles

The system supports the following user roles:
- `user` - Regular user (default)
- `admin` - Administrator user
- `employer` - Employer/Company user
- `superuser` - Super user (has access to everything)

## API Endpoints

### 1. Get Current User's Role

**Endpoint:** `GET /api/v1/auth/my-role`

**Description:** Get the current logged-in user's role information.

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "username": "username",
  "role": "admin",
  "is_superuser": false,
  "is_active": true
}
```

### 2. Check User Role

**Endpoint:** `GET /api/v1/auth/check-role/{required_role}`

**Description:** Check if the current user has the required role.

**Parameters:**
- `required_role` (path parameter): The role to check for (user, admin, employer)

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "username": "username",
  "current_role": "admin",
  "required_role": "employer",
  "has_required_role": false,
  "is_superuser": false,
  "access_granted": false
}
```

**Note:** Superusers automatically have access to all roles.

### 3. Admin Dashboard (Example)

**Endpoint:** `GET /api/v1/jobs/admin/dashboard`

**Description:** Example endpoint that requires admin role.

**Authentication:** Required (Bearer token)
**Role Required:** admin or superuser

### 4. Employer Jobs (Example)

**Endpoint:** `GET /api/v1/jobs/employer/my-jobs`

**Description:** Example endpoint that requires employer role.

**Authentication:** Required (Bearer token)
**Role Required:** employer or superuser

## Usage Examples

### Frontend Usage

```javascript
// Get current user's role
const response = await fetch('/api/v1/auth/my-role', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const userRole = await response.json();
console.log('User role:', userRole.role);

// Check if user has admin role
const checkResponse = await fetch('/api/v1/auth/check-role/admin', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const roleCheck = await checkResponse.json();
if (roleCheck.access_granted) {
  // Show admin features
  console.log('User has admin access');
}
```

### Backend Usage (Dependencies)

You can use the role checking dependencies in your FastAPI endpoints:

```python
from app.api import deps

# Check for specific role
@router.get("/admin-only")
def admin_only_endpoint(
    current_user: User = Depends(deps.get_admin_user)
):
    return {"message": "Admin only content"}

# Check for employer role
@router.get("/employer-only")
def employer_only_endpoint(
    current_user: User = Depends(deps.get_employer_user)
):
    return {"message": "Employer only content"}

# Check for any specific role
@router.get("/user-specific")
def user_specific_endpoint(
    current_user: User = Depends(deps.get_user_with_role("user"))
):
    return {"message": "User specific content"}
```

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Access denied. Required role: admin"
}
```

### 400 Bad Request
```json
{
  "detail": "Inactive user"
}
```

## Security Notes

1. **Superuser Privileges:** Users with `is_superuser=True` have access to all roles and endpoints.
2. **Token Validation:** All endpoints require a valid JWT token in the Authorization header.
3. **Role Hierarchy:** There's no strict hierarchy - each role is independent, but superusers have access to everything.
4. **Active Users Only:** Only active users can access role-checking endpoints.

## Testing the APIs

1. **Login first** to get a token:
   ```bash
   curl -X POST "http://localhost:8000/api/v1/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=your_email@example.com&password=your_password"
   ```

2. **Get your role** using the token:
   ```bash
   curl -X GET "http://localhost:8000/api/v1/auth/my-role" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

3. **Check specific role**:
   ```bash
   curl -X GET "http://localhost:8000/api/v1/auth/check-role/admin" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```




