# 🔍 Debug Registration Issue

## Problem
Getting error: "Value error, Either email or mobile_number must be provided" even though mobile number is provided.

## 🔧 Debugging Applied

### 1. **Added Console Logging**
The registration now logs:
- Full registration payload
- Individual field values
- Mobile number with country code

### 2. **Fixed Field Handling**
- Changed `email: email || null` to `email: email || ''`
- Changed `mobile_number` to `mobile_number: mobile_number || ''`
- Added validation to ensure at least one contact method

### 3. **Possible Issues**

#### **Issue 1: Backend Field Validation**
The backend might be expecting:
- Both fields to be present (even if empty)
- Specific field names
- Non-empty strings instead of null values

#### **Issue 2: Mobile Number Format**
The mobile number might need:
- Specific format (digits only, with/without country code)
- Validation on the backend side

#### **Issue 3: Backend Logic**
The backend validation might be:
- Checking for empty strings as "not provided"
- Expecting both fields to be non-empty
- Using different field names

## 🧪 Test Steps

1. **Open browser console** (F12)
2. **Try registering** with mobile number only
3. **Check console logs** to see:
   - What payload is being sent
   - What the mobile number value is
   - What the email value is

## 🔍 Expected Console Output
```
Registration payload: {
  email: "",
  username: "+918408844490",
  password: "****",
  full_name: "OMKAR NILAKH",
  role: "admin",
  mobile_number: "+918408844490",
  verification_method: "mobile"
}
Email: 
Mobile Number: 8408844490
Country Code: +91
Mobile Number with country code: +918408844490
```

## 🎯 Next Steps

After checking console logs:
1. **If mobile_number is empty**: Check mobile number field handling
2. **If payload looks correct**: Check backend validation logic
3. **If backend expects different format**: Update payload structure

The console logs will show exactly what's being sent to the backend! 🔍

