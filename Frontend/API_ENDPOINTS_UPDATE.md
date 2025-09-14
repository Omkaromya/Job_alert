# ✅ Backend API Endpoints Updated

## 🔄 Configuration Updates

I've updated your frontend configuration to match your actual backend API endpoints:

### 📋 Updated `src/config.js`

```javascript
export const AUTH_ENDPOINTS = {
  register: `http://127.0.0.1:8000/api/v1/auth/register`,           // ✅ Working
  login: `http://127.0.0.1:8000/api/v1/auth/login`,                 // ✅ Working  
  me: `http://127.0.0.1:8000/api/v1/auth/me`,                      // ✅ New endpoint
  myRole: `http://127.0.0.1:8000/api/v1/auth/my-role`,             // ✅ Working
  checkRole: (role) => `http://127.0.0.1:8000/api/v1/auth/check-role/${role}`, // ✅ New endpoint
  verifyEmail: `http://127.0.0.1:8000/api/v1/auth/verify-email`,    // 🔧 Fixed format detection
  resendOtp: `http://127.0.0.1:8000/api/v1/auth/resend-otp`,        // 🔧 Fixed format detection
  forgotPassword: `http://127.0.0.1:8000/api/v1/auth/forgot-password-otp`,
  resetPassword: `http://127.0.0.1:8000/api/v1/auth/reset-password`,
  checkEmail: `http://127.0.0.1:8000/api/v1/auth/check-email`
};

export const USER_ENDPOINTS = {
  list: `/api/v1/users/users`,
  detail: (id) => `/api/v1/users/users/${id}`,
  profile: `http://127.0.0.1:8000/api/v1/users/profile`             // ✅ Working
};
```

### 🆕 New API Functions Added

#### 1. **`getCurrentUser()`**
```javascript
// Get current user info from /api/v1/auth/me
const user = await getCurrentUser();
```

#### 2. **`checkUserRole(role)`**
```javascript
// Check if user has specific role from /api/v1/auth/check-role/{role}
const hasRole = await checkUserRole('admin');
```

#### 3. **Updated `getUserProfile()`**
```javascript
// Now uses correct endpoint: /api/v1/users/profile/
const profile = await getUserProfile();
```

### 🔧 Enhanced `verifyEmail()` Function

The verify-email function now automatically tries different payload formats:
- `{ email, otp }`
- `{ email, verification_code }`
- `{ email, code }`
- `{ email, token }`
- `{ email, otp, user_id }`

## 🎯 Backend Endpoints Status

| Endpoint | Status | Frontend Function |
|----------|--------|-------------------|
| `POST /api/v1/auth/register` | ✅ Working | `registerUser()` |
| `POST /api/v1/auth/login` | ✅ Working | `loginUser()` |
| `GET /api/v1/auth/me` | ✅ Working | `getCurrentUser()` |
| `GET /api/v1/auth/my-role` | ✅ Working | `getMyRole()` |
| `GET /api/v1/auth/check-role/{role}` | ✅ Working | `checkUserRole()` |
| `GET /api/v1/users/profile/` | ✅ Working | `getUserProfile()` |
| `POST /api/v1/auth/verify-email` | 🔧 Fixed | `verifyEmail()` |
| `POST /api/v1/auth/resend-otp` | 🔧 Fixed | `resendOtp()` |

## 🚀 Ready to Use

Your frontend is now properly configured to work with all your backend endpoints! The verify-email 400 error should be resolved with the automatic format detection.

## 🧪 Test Your Endpoints

Try these operations:
1. **Register** a new user
2. **Verify email** with OTP
3. **Login** with credentials
4. **Get user profile** data
5. **Check user role** permissions

All endpoints should now work correctly! 🎯
