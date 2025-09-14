# Password Reset API Testing Guide

## Endpoints

### 1. Forgot Password
- **POST** `/api/v1/auth/forgot-password`
- **Body:** `{"email": "user@example.com"}`
- **Response:** `{"message": "If the email exists, a password reset link has been sent."}`

### 2. Verify Reset Token
- **GET** `/api/v1/auth/verify-reset-token/{token}`
- **Response:** `{"message": "Token is valid", "email": "user@example.com"}`

### 3. Reset Password
- **POST** `/api/v1/auth/reset-password`
- **Body:** `{"token": "your_token", "new_password": "newpass123", "confirm_password": "newpass123"}`
- **Response:** `{"message": "Password reset successfully."}`

## Postman Testing

### Step 1: Request Password Reset
1. **Method:** POST
2. **URL:** `http://localhost:8000/api/v1/auth/forgot-password`
3. **Headers:** `Content-Type: application/json`
4. **Body:** `{"email": "your_email@example.com"}`

### Step 2: Check Email
- Look for password reset email
- Extract the token from the email link

### Step 3: Verify Token (Optional)
1. **Method:** GET
2. **URL:** `http://localhost:8000/api/v1/auth/verify-reset-token/YOUR_TOKEN_HERE`
3. **Headers:** None required

### Step 4: Reset Password
1. **Method:** POST
2. **URL:** `http://localhost:8000/api/v1/auth/reset-password`
3. **Headers:** `Content-Type: application/json`
4. **Body:** `{"token": "token_from_email", "new_password": "NewPassword123!", "confirm_password": "NewPassword123!"}`

## Error Testing

### Invalid Token
- Use wrong token → `"Invalid or expired reset token"`

### Password Mismatch
- Different passwords → `"Passwords do not match"`

### Short Password
- Password < 8 chars → `"Password must be at least 8 characters long"`

### Expired Token
- Wait > 1 hour → `"Invalid or expired reset token"`
