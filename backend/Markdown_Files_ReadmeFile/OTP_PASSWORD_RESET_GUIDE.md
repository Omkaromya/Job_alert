# OTP-Based Password Reset System Guide

## 🔐 **New OTP-Based Endpoints**

### **1. Forgot Password OTP**
- **Endpoint:** `POST /api/v1/auth/forgot-password-otp`
- **Description:** Request password reset OTP via email
- **Authentication:** Not required

### **2. Reset Password OTP**
- **Endpoint:** `POST /api/v1/auth/reset-password-otp`
- **Description:** Reset password using OTP from email
- **Authentication:** Not required (uses OTP)

---

## 📧 **How OTP System Works (Backend vs Frontend)**

### **Backend Responsibilities:**
✅ **Generate 6-digit OTP**  
✅ **Store OTP in database** with expiration (10 minutes)  
✅ **Send OTP via email**  
✅ **Validate OTP** when resetting password  
✅ **Update password** after OTP verification  
✅ **Clear OTP** after successful reset  

### **Frontend Responsibilities:**
✅ **Collect user email** for OTP request  
✅ **Display OTP input field**  
✅ **Collect new password** and confirmation  
✅ **Send OTP + new password** to backend  
✅ **Show success/error messages**  

---

## 🚀 **Complete Testing Workflow in Postman**

### **Step 1: Request Password Reset OTP**

**Request Details:**
- **Method:** `POST`
- **URL:** `http://localhost:8000/api/v1/auth/forgot-password-otp`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "email": "your_email@example.com"
  }
  ```

**Expected Response:**
```json
{
  "message": "If the email exists, a password reset OTP has been sent."
}
```

**What Happens Backend:**
1. ✅ Generates 6-digit OTP
2. ✅ Stores OTP in `password_reset_otp` field
3. ✅ Sets expiration in `password_reset_otp_expires_at` (10 minutes)
4. ✅ Sends OTP via email
5. ✅ Returns security message

---

### **Step 2: Check Your Email**

1. **Check inbox** for email with subject: "Password Reset OTP - Job Alert System"
2. **Email contains:**
   - **Large OTP display** (e.g., `123456`)
   - **Plain text OTP** for easy copying
   - **10-minute expiration** notice

**Email Example:**
```
Subject: Password Reset OTP - Job Alert System

Hi username,

You have requested to reset your password. Use the OTP below to reset it:

Your password reset OTP is: 123456

This OTP will expire in 10 minutes.
```

---

### **Step 3: Reset Password with OTP**

**Request Details:**
- **Method:** `POST`
- **URL:** `http://localhost:8000/api/v1/auth/reset-password-otp`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "email": "your_email@example.com",
    "otp": "123456",
    "new_password": "NewPassword123!",
    "confirm_password": "NewPassword123!"
  }
  ```

**Expected Response (Success):**
```json
{
  "message": "Password reset successfully."
}
```

---

## 🧪 **Error Testing Scenarios**

### **1. Test Invalid OTP**
**Request:**
```json
{
  "email": "your_email@example.com",
  "otp": "999999",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

**Expected Response:**
```json
{
  "detail": "Invalid OTP. Please check and try again."
}
```

### **2. Test Expired OTP**
**To test this:**
1. Request OTP
2. Wait more than 10 minutes
3. Try to use the OTP

**Expected Response:**
```json
{
  "detail": "OTP has expired. Please request a new OTP."
}
```

### **3. Test Password Mismatch**
**Request:**
```json
{
  "email": "your_email@example.com",
  "otp": "123456",
  "new_password": "NewPassword123!",
  "confirm_password": "DifferentPassword123!"
}
```

**Expected Response:**
```json
{
  "detail": "Passwords do not match."
}
```

### **4. Test Short Password**
**Request:**
```json
{
  "email": "your_email@example.com",
  "otp": "123456",
  "new_password": "123",
  "confirm_password": "123"
}
```

**Expected Response:**
```json
{
  "detail": "Password must be at least 8 characters long."
}
```

---

## 📋 **Postman Collection Setup**

### **1. Create Environment Variables**
```
base_url: http://localhost:8000
user_email: your_email@example.com
reset_otp: (leave empty initially)
```

### **2. Create Requests**

#### **Forgot Password OTP:**
```
Method: POST
URL: {{base_url}}/api/v1/auth/forgot-password-otp
Headers: Content-Type: application/json
Body: {"email": "{{user_email}}"}
```

#### **Reset Password OTP:**
```
Method: POST
URL: {{base_url}}/api/v1/auth/reset-password-otp
Headers: Content-Type: application/json
Body: {
  "email": "{{user_email}}",
  "otp": "{{reset_otp}}",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

---

## 🔍 **Testing Checklist**

- [ ] **Forgot Password OTP** endpoint works
- [ ] **Email is sent** with OTP (not link)
- [ ] **OTP is stored** in database
- [ ] **OTP expires** after 10 minutes
- [ ] **Reset Password OTP** endpoint works
- [ ] **Password validation** works (length, confirmation)
- [ ] **OTP validation** works (invalid, expired)
- [ ] **Error messages** are clear
- [ ] **Security** is maintained
- [ ] **New password** works for login

---

## ⚠️ **Important Notes**

1. **Security:** API never reveals if email exists
2. **OTP Expiry:** OTP expires after 10 minutes (faster than links)
3. **Password Requirements:** Minimum 8 characters
4. **Email Verification:** Only active users can reset passwords
5. **OTP Storage:** OTP is stored in database, not JWT tokens
6. **Rate Limiting:** Consider implementing for production

---

## 🚀 **Quick Test Commands (cURL)**

**Forgot Password OTP:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/forgot-password-otp" \
  -H "Content-Type: application/json" \
  -d '{"email": "your_email@example.com"}'
```

**Reset Password OTP:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/reset-password-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your_email@example.com",
    "otp": "123456",
    "new_password": "NewPassword123!",
    "confirm_password": "NewPassword123!"
  }'
```

---

## 🔄 **Database Migration Required**

Since we added new fields to the User model, you'll need to create a database migration:

```bash
# Generate migration
alembic revision --autogenerate -m "Add password reset OTP fields"

# Apply migration
alembic upgrade head
```

---

## 📊 **Comparison: Link vs OTP System**

| Feature | Link System | OTP System |
|---------|-------------|------------|
| **Security** | JWT tokens | 6-digit OTP |
| **Expiry** | 1 hour | 10 minutes |
| **User Experience** | Click link | Enter OTP |
| **Frontend Complexity** | Simple redirect | Form handling |
| **Backend Storage** | No storage needed | Store OTP in DB |
| **Email Content** | Reset link | OTP number |
| **Mobile Friendly** | ✅ | ✅✅ |

---

## 🎯 **Frontend Implementation Tips**

1. **OTP Input:** Use 6 separate input fields or one field with formatting
2. **Timer:** Show countdown timer for OTP expiration
3. **Resend:** Allow users to request new OTP after expiration
4. **Validation:** Real-time password strength validation
5. **Loading States:** Show loading during OTP request and password reset

This OTP system provides better security and user experience compared to link-based reset!
