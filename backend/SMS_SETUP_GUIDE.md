# SMS OTP Setup Guide

This guide explains how to set up SMS OTP functionality using Twilio for your Job Alert API.

## 📱 **How SMS OTP Works**

When a user registers with a mobile number:
1. **Your Twilio Phone Number** sends an SMS to the **user's mobile number**
2. The SMS contains a 6-digit OTP code
3. User enters the OTP to verify their account

## 🔧 **Setup Steps**

### **Step 1: Create Twilio Account**

1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account
3. Verify your phone number
4. Get your **Account SID** and **Auth Token** from the dashboard

### **Step 2: Get a Twilio Phone Number**

1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Choose a phone number (free trial accounts get one free number)
3. Note down the phone number (format: +1234567890)

### **Step 3: Configure Environment Variables**

Add these to your `.env` file:

```env
# SMS settings (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### **Step 4: Install Twilio Library**

```bash
pip install twilio==8.10.0
```

### **Step 5: Test SMS Functionality**

The SMS service is already integrated into your API endpoints:

- **Registration**: `POST /api/v1/auth/register` (with mobile_number)
- **Verification**: `POST /api/v1/auth/verify` (with mobile_number and otp)
- **Resend OTP**: `POST /api/v1/auth/resend-otp` (with mobile_number)

## 📋 **API Usage Examples**

### **Mobile Registration**
```json
POST /api/v1/auth/register
{
  "username": "john_doe",
  "mobile_number": "+1234567890",
  "password": "securepassword123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully. Please check your mobile for verification OTP.",
  "user_id": 123,
  "mobile_number": "+1234567890",
  "verification_method": "mobile"
}
```

### **Mobile Verification**
```json
POST /api/v1/auth/verify
{
  "mobile_number": "+1234567890",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Mobile verified successfully. You can now log in.",
  "verified": true,
  "verification_method": "mobile"
}
```

## 💰 **Cost Information**

### **Twilio Pricing (as of 2024)**
- **Free Trial**: $15 credit (approximately 1,500 SMS messages)
- **US SMS**: ~$0.0075 per message
- **International SMS**: Varies by country (~$0.01-$0.10 per message)

### **Cost Optimization Tips**
1. **Rate Limiting**: Implement rate limiting to prevent abuse
2. **OTP Expiry**: Set short expiry times (10 minutes) to reduce resend requests
3. **Free Trial**: Use Twilio's free trial for development and testing

## 🔒 **Security Features**

### **Built-in Security**
- ✅ **6-digit OTP**: Random 6-digit codes
- ✅ **10-minute expiry**: OTPs expire after 10 minutes
- ✅ **Single use**: OTPs are invalidated after successful verification
- ✅ **Rate limiting**: Built into Twilio's service
- ✅ **Secure storage**: OTPs are stored in database with expiry timestamps

### **Additional Security Recommendations**
1. **Phone Number Validation**: Validate phone number format
2. **Country Code Enforcement**: Require country codes (+1, +91, etc.)
3. **Suspicious Activity Monitoring**: Monitor for unusual patterns
4. **SMS Delivery Reports**: Track delivery status

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. SMS Not Received**
- Check if phone number includes country code (+1 for US)
- Verify Twilio account has sufficient credits
- Check Twilio logs for delivery status

#### **2. "SMS service not configured" Warning**
- Ensure environment variables are set correctly
- Check if Twilio credentials are valid
- Verify Twilio library is installed

#### **3. Invalid Phone Number Error**
- Ensure phone number format: +1234567890
- Check if number is valid in Twilio's system
- Some numbers may be restricted (landlines, etc.)

### **Testing Without Real SMS**

For development/testing, you can:
1. Use Twilio's test credentials (messages won't be sent)
2. Check application logs for OTP values
3. Use Twilio's webhook testing tools

## 📞 **Alternative SMS Providers**

If you prefer other SMS providers:

### **Vonage (Nexmo)**
```python
from vonage import Sms
# Implementation similar to Twilio
```

### **AWS SNS**
```python
import boto3
# Implementation using AWS SNS
```

### **Plivo**
```python
import plivo
# Implementation similar to Twilio
```

## 🔄 **Fallback Options**

If SMS fails:
1. **Email Fallback**: Allow users to add email for OTP delivery
2. **Voice OTP**: Use Twilio's voice service for OTP delivery
3. **WhatsApp**: Use Twilio's WhatsApp API (if available)

## 📊 **Monitoring & Analytics**

### **Track SMS Metrics**
- Delivery rates
- Failure reasons
- Cost per verification
- User completion rates

### **Twilio Console**
- Monitor SMS delivery in real-time
- View usage and billing
- Set up alerts for failures

## 🎯 **Best Practices**

1. **Always include country codes** in phone numbers
2. **Implement proper error handling** for SMS failures
3. **Log SMS activities** for debugging
4. **Set up monitoring** for delivery rates
5. **Use environment variables** for credentials
6. **Test with real phone numbers** before production
7. **Implement rate limiting** to prevent abuse
8. **Keep OTP expiry short** (5-10 minutes)

---

## 🚀 **Quick Start**

1. **Get Twilio credentials** from console.twilio.com
2. **Add credentials** to your `.env` file
3. **Install Twilio**: `pip install twilio==8.10.0`
4. **Test registration** with a mobile number
5. **Check your phone** for the OTP message!

Your SMS OTP system is now ready! 🎉
