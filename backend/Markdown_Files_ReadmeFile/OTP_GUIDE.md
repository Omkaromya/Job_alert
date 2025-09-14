# OTP Password Reset System

## New Endpoints

### 1. Forgot Password OTP
- **POST** `/api/v1/auth/forgot-password-otp`
- **Body:** `{"email": "user@example.com"}`
- **Response:** `{"message": "If the email exists, a password reset OTP has been sent."}`

### 2. Reset Password OTP
- **POST** `/api/v1/auth/reset-password-otp`
- **Body:** `{"email": "user@example.com", "otp": "123456", "new_password": "newpass123", "confirm_password": "newpass123"}`
- **Response:** `{"message": "Password reset successfully."}`

## How It Works

### Backend (Your Responsibility):
✅ Generate 6-digit OTP  
✅ Store OTP in database with 10-minute expiry  
✅ Send OTP via email  
✅ Validate OTP when resetting password  
✅ Update password after verification  

### Frontend (User's Responsibility):
✅ Collect email for OTP request  
✅ Display OTP input field  
✅ Collect new password + confirmation  
✅ Send OTP + new password to backend  

## Postman Testing

### Step 1: Request OTP
```http
POST http://localhost:8000/api/v1/auth/forgot-password-otp
Content-Type: application/json

{
  "email": "your_email@example.com"
}
```

### Step 2: Check Email for OTP
- Look for email with subject: "Password Reset OTP"
- Extract the 6-digit OTP (e.g., 123456)

### Step 3: Reset Password
```http
POST http://localhost:8000/api/v1/auth/reset-password-otp
Content-Type: application/json

{
  "email": "your_email@example.com",
  "otp": "123456",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

## Error Testing

- **Invalid OTP:** `"Invalid OTP. Please check and try again."`
- **Expired OTP:** `"OTP has expired. Please request a new OTP."`
- **Password Mismatch:** `"Passwords do not match."`
- **Short Password:** `"Password must be at least 8 characters long."`

## Database Migration Required

Run these commands to add new fields:
```bash
alembic revision --autogenerate -m "Add password reset OTP fields"
alembic upgrade head
```

## Why OTP is Better Than Links

1. **More Secure** - 6-digit code vs long URL
2. **Faster Expiry** - 10 minutes vs 1 hour
3. **Better UX** - Enter code vs click link
4. **Mobile Friendly** - Works on all devices
5. **No URL Manipulation** - Cannot be tampered with
