# Postman Testing Steps for Password Reset

## 🚀 **Complete Testing Workflow**

### **Step 1: Request Password Reset**

**Request Details:**
- **Method:** `POST`
- **URL:** `http://localhost:8000/api/v1/auth/forgot-password`
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
  "message": "If the email exists, a password reset link has been sent."
}
```

**What Happens:**
1. System checks if email exists
2. If email exists and user is active, generates reset token
3. Sends email with reset link
4. Returns same message for security (doesn't reveal if email exists)

---

### **Step 2: Check Your Email**

1. **Check inbox** for email with subject: "Password Reset - Job Alert System"
2. **Email contains:**
   - HTML button to reset password
   - Direct link with token
   - Token expires in 1 hour

**Email Link Format:**
```
http://localhost:8000/api/v1/auth/reset-password?email=your_email&token=YOUR_TOKEN
```

**Extract the token** from the email link for next steps.

---

### **Step 3: Verify Token (Optional but Recommended)**

**Request Details:**
- **Method:** `GET`
- **URL:** `http://localhost:8000/api/v1/auth/verify-reset-token/YOUR_TOKEN_HERE`
- **Headers:** None required

**Expected Response (Valid Token):**
```json
{
  "message": "Token is valid",
  "email": "your_email@example.com"
}
```

**Expected Response (Invalid/Expired Token):**
```json
{
  "detail": "Invalid or expired reset token."
}
```

---

### **Step 4: Reset Password**

**Request Details:**
- **Method:** `POST`
- **URL:** `http://localhost:8000/api/v1/auth/reset-password`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "token": "YOUR_TOKEN_FROM_EMAIL",
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

### **1. Test Invalid Token**
**Request:**
```json
{
  "token": "invalid_token_here",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

**Expected Response:**
```json
{
  "detail": "Invalid or expired reset token."
}
```

### **2. Test Password Mismatch**
**Request:**
```json
{
  "token": "YOUR_VALID_TOKEN",
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

### **3. Test Short Password**
**Request:**
```json
{
  "token": "YOUR_VALID_TOKEN",
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

### **4. Test Expired Token**
**To test this:**
1. Request password reset
2. Wait more than 1 hour
3. Try to use the token

**Expected Response:**
```json
{
  "detail": "Invalid or expired reset token."
}
```

---

## 📋 **Postman Collection Setup**

### **1. Create Environment Variables**
```
base_url: http://localhost:8000
reset_token: (leave empty initially)
```

### **2. Create Requests**

#### **Forgot Password:**
```
Method: POST
URL: {{base_url}}/api/v1/auth/forgot-password
Headers: Content-Type: application/json
Body: {"email": "your_email@example.com"}
```

#### **Verify Token:**
```
Method: GET
URL: {{base_url}}/api/v1/auth/verify-reset-token/{{reset_token}}
```

#### **Reset Password:**
```
Method: POST
URL: {{base_url}}/api/v1/auth/reset-password
Headers: Content-Type: application/json
Body: {
  "token": "{{reset_token}}",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

---

## 🔍 **Testing Checklist**

- [ ] **Forgot Password** endpoint works
- [ ] **Email is sent** with reset link
- [ ] **Token verification** endpoint works
- [ ] **Reset Password** endpoint works
- [ ] **Password validation** works (length, confirmation)
- [ ] **Token validation** works (invalid, expired)
- [ ] **Error messages** are clear
- [ ] **Security** is maintained
- [ ] **New password** works for login

---

## ⚠️ **Important Notes**

1. **Security:** API never reveals if email exists
2. **Token Expiry:** Reset tokens expire after 1 hour
3. **Password Requirements:** Minimum 8 characters
4. **Email Verification:** Only active users can reset passwords
5. **Rate Limiting:** Consider implementing for production

---

## 🚀 **Quick Test Commands (cURL)**

**Forgot Password:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email": "your_email@example.com"}'
```

**Verify Token:**
```bash
curl -X GET "http://localhost:8000/api/v1/auth/verify-reset-token/YOUR_TOKEN_HERE"
```

**Reset Password:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN_HERE",
    "new_password": "NewPassword123!",
    "confirm_password": "NewPassword123!"
  }'
```

This guide will help you thoroughly test all password reset functionality in Postman!
