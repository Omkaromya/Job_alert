# 🔧 Quick Fix for Verify Email 400 Error

## ✅ Solution Applied

I've updated the `verifyEmail` function in `src/api/auth.js` to automatically try different payload formats that backends commonly expect:

### 🔄 What the Updated Function Does:

1. **Tries Multiple Formats**: Automatically tests different field name combinations:
   - `{ email, otp }` (current format)
   - `{ email, verification_code }` (common alternative)
   - `{ email, code }` (another common alternative)
   - `{ email, token }` (some backends use this)
   - `{ email, otp, user_id }` (with user ID if available)

2. **Smart Error Handling**: If one format returns 400, it tries the next format automatically

3. **Console Logging**: Shows which formats are being tried for debugging

## 🧪 Test It Now

Try verifying an email now - the function will automatically find the correct format that your backend expects.

## 🔍 If Still Not Working

If you're still getting errors, run this in your browser console to see exactly what's happening:

```javascript
// Test the endpoint directly
fetch('http://127.0.0.1:8000/api/v1/auth/verify-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'your-email@example.com', otp: '123456' })
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
```

## 📋 Common Backend Expectations

The backend might expect:
- **Field Names**: `verification_code`, `code`, `token` instead of `otp`
- **Data Types**: String vs number for OTP
- **Additional Fields**: `user_id`, `email_verified`, etc.
- **Request Format**: Form data instead of JSON

## 🎯 Expected Result

Once the correct format is found, you should see:
```json
{
  "message": "Email verified successfully",
  "user_id": 1,
  "email": "user@example.com"
}
```

The updated function will automatically find and use the correct format! 🚀
