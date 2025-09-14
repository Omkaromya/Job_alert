# Password Reset API Testing Guide for Postman

This guide explains how to test the forgot password and reset password endpoints in Postman.

## 🔐 **API Endpoints**

### **1. Forgot Password**
- **Endpoint:** `POST /api/v1/auth/forgot-password`
- **Description:** Request a password reset email
- **Authentication:** Not required

### **2. Reset Password**
- **Endpoint:** `POST /api/v1/auth/reset-password`
- **Description:** Reset password using token from email
- **Authentication:** Not required (uses token from email)

---

## 📧 **Step-by-Step Testing in Postman**

### **Step 1: Request Password Reset (Forgot Password)**

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

**Expected Response (Success):**
```json
{
  "message": "If the email exists, a password reset link has been sent."
}
```

**Expected Response (Invalid Email):**
```json
{
  "message": "If the email exists, a password reset link has been sent."
}
```

**Note:** The API always returns the same message for security reasons (doesn't reveal if email exists).

---

### **Step 2: Check Your Email**

After calling the forgot-password endpoint:
1. Check your email inbox
2. Look for an email with subject: "Password Reset - Job Alert System"
3. The email contains a reset link with a token

**Email Content:**
- HTML button to reset password
- Direct link: `http://localhost:8000/api/v1/auth/reset-password?email=your_email&token=YOUR_TOKEN`
- Token expires in 1 hour

---

### **Step 3: Reset Password**

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

## 🚨 **Error Scenarios & Testing**

### **1. Invalid Token**
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

### **2. Passwords Don't Match**
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

### **3. Password Too Short**
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

### **4. Expired Token**
**Note:** Tokens expire after 1 hour. To test this:
1. Request a password reset
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

#### **Forgot Password Request:**
```
Method: POST
URL: {{base_url}}/api/v1/auth/forgot-password
Headers: Content-Type: application/json
Body (raw JSON):
{
  "email": "your_email@example.com"
}
```

#### **Reset Password Request:**
```
Method: POST
URL: {{base_url}}/api/v1/auth/reset-password
Headers: Content-Type: application/json
Body (raw JSON):
{
  "token": "{{reset_token}}",
  "new_password": "NewPassword123!",
  "confirm_password": "NewPassword123!"
}
```

---

## 🧪 **Complete Testing Workflow**

### **Test Case 1: Successful Password Reset**
1. **Call forgot-password** with valid email
2. **Check email** for reset link
3. **Extract token** from email
4. **Call reset-password** with token and new password
5. **Verify success** message
6. **Test login** with new password

### **Test Case 2: Invalid Email**
1. **Call forgot-password** with non-existent email
2. **Verify** same response message (security)

### **Test Case 3: Password Validation**
1. **Call reset-password** with mismatched passwords
2. **Call reset-password** with short password
3. **Verify** appropriate error messages

### **Test Case 4: Token Validation**
1. **Call reset-password** with invalid token
2. **Call reset-password** with expired token
3. **Verify** token error messages

---

## 📧 **Email Configuration Requirements**

Make sure your email settings are configured in `.env`:
```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com
```

**For Gmail:**
- Enable 2-factor authentication
- Generate an App Password
- Use the App Password in MAIL_PASSWORD

---

## 🔍 **Testing Checklist**

- [ ] **Forgot Password** endpoint works
- [ ] **Email is sent** with reset link
- [ ] **Reset Password** endpoint works
- [ ] **Password validation** works (length, confirmation)
- [ ] **Token validation** works (invalid, expired)
- [ ] **Error messages** are clear and appropriate
- [ ] **Security** is maintained (same response for all emails)
- [ ] **New password** works for login

---

## ⚠️ **Important Notes**

1. **Security:** The API never reveals if an email exists in the system
2. **Token Expiry:** Reset tokens expire after 1 hour
3. **Password Requirements:** Minimum 8 characters
4. **Email Verification:** Only active users can reset passwords
5. **Rate Limiting:** Consider implementing rate limiting for production

---

## 🚀 **Quick Test Commands**

### **Using cURL:**

**Forgot Password:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email": "your_email@example.com"}'
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

This guide will help you thoroughly test the password reset functionality in Postman!
