# Debug Verify Email Endpoint

## 🔍 Current Issue
Getting 400 Bad Request on `http://127.0.0.1:8000/api/v1/auth/verify-email`

## 📋 Current Frontend Request Format
```javascript
// From src/App.js line 843
await verifyEmail({ email: registerEmail, otp: code });

// From src/api/auth.js line 41-46
export async function verifyEmail(payload) {
  return requestJson(AUTH_ENDPOINTS.verifyEmail, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
```

## 🧪 Debugging Steps

### Step 1: Test the endpoint directly
Run this in your browser console:

```javascript
// Test current format
fetch('http://127.0.0.1:8000/api/v1/auth/verify-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com', otp: '123456' })
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
```

### Step 2: Check what the backend expects
The backend might expect:
- Different field names (`verification_code` instead of `otp`)
- Different data types (string vs number)
- Additional required fields
- Different request format

### Step 3: Common Backend Expectations
Try these alternative formats:

```javascript
// Format 1: Different field names
{ email: 'test@example.com', verification_code: '123456' }

// Format 2: With user_id
{ email: 'test@example.com', otp: '123456', user_id: 1 }

// Format 3: Different structure
{ user_email: 'test@example.com', otp_code: '123456' }

// Format 4: Form data instead of JSON
const formData = new FormData();
formData.append('email', 'test@example.com');
formData.append('otp', '123456');
```

## 🔧 Quick Fixes to Try

### Fix 1: Check if endpoint needs trailing slash
```javascript
// Try with trailing slash
fetch('http://127.0.0.1:8000/api/v1/auth/verify-email/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com', otp: '123456' })
})
```

### Fix 2: Try different field names
Update `src/api/auth.js`:
```javascript
export async function verifyEmail(payload) {
  // Try different field names
  const backendPayload = {
    email: payload.email,
    verification_code: payload.otp  // Instead of 'otp'
  };
  
  return requestJson(AUTH_ENDPOINTS.verifyEmail, {
    method: 'POST',
    body: JSON.stringify(backendPayload)
  });
}
```

### Fix 3: Check if backend expects form data
```javascript
export async function verifyEmail(payload) {
  const formData = new FormData();
  formData.append('email', payload.email);
  formData.append('otp', payload.otp);
  
  return requestJson(AUTH_ENDPOINTS.verifyEmail, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(formData)
  });
}
```

## 🎯 Next Steps
1. Run the debug script in browser console
2. Check backend logs for detailed error messages
3. Test different payload formats
4. Update the frontend code based on what works

## 📝 Expected Backend Response
If working correctly, should return something like:
```json
{
  "message": "Email verified successfully",
  "user_id": 1,
  "email": "user@example.com"
}
```

