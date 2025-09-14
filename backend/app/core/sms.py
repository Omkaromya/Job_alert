"""
SMS service for sending OTP messages
"""
import os
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Try to import Twilio, but don't fail if it's not installed
try:
    from twilio.rest import Client
    from twilio.base.exceptions import TwilioException
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
    logger.warning("Twilio not installed. SMS functionality will be disabled. Install with: pip install twilio")

class SMSService:
    def __init__(self):
        if not TWILIO_AVAILABLE:
            logger.warning("SMS service disabled - Twilio not installed")
            self.client = None
            self.is_configured = False
            return
            
        # Import settings here to avoid circular imports
        try:
            from app.config import settings
            self.account_sid = settings.TWILIO_ACCOUNT_SID
            self.auth_token = settings.TWILIO_AUTH_TOKEN
            self.from_number = settings.TWILIO_PHONE_NUMBER
        except Exception as e:
            logger.error(f"Failed to load settings: {e}")
            # Fallback to environment variables
            self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
            self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
            self.from_number = os.getenv("TWILIO_PHONE_NUMBER")
        
        # Initialize Twilio client if credentials are available
        if self.account_sid and self.auth_token:
            try:
                self.client = Client(self.account_sid, self.auth_token)
                self.is_configured = True
                logger.info("SMS service configured successfully")
            except Exception as e:
                logger.error(f"Failed to initialize SMS service: {e}")
                self.client = None
                self.is_configured = False
        else:
            logger.warning("SMS service not configured - missing Twilio credentials")
            self.client = None
            self.is_configured = False
    
    def send_otp(self, mobile_number: str, otp: str, username: str = None) -> bool:
        """
        Send OTP via SMS
        
        Args:
            mobile_number: User's mobile number (with country code)
            otp: 6-digit OTP code
            username: User's username (optional)
        
        Returns:
            bool: True if SMS sent successfully, False otherwise
        """
        if not self.is_configured:
            logger.warning("SMS service not configured - OTP not sent")
            return False
        
        try:
            # Format the message
            if username:
                message_body = f"Hi {username}! Your Job Alert verification code is: {otp}. This code will expire in 10 minutes."
            else:
                message_body = f"Your Job Alert verification code is: {otp}. This code will expire in 10 minutes."
            
            # Send SMS
            message = self.client.messages.create(
                body=message_body,
                from_=self.from_number,
                to=mobile_number
            )
            
            logger.info(f"SMS sent successfully to {mobile_number}, SID: {message.sid}")
            return True
            
        except TwilioException as e:
            logger.error(f"Twilio error sending SMS to {mobile_number}: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending SMS to {mobile_number}: {e}")
            return False
    
    def send_password_reset_otp(self, mobile_number: str, otp: str, username: str = None) -> bool:
        """
        Send password reset OTP via SMS
        
        Args:
            mobile_number: User's mobile number (with country code)
            otp: 6-digit OTP code
            username: User's username (optional)
        
        Returns:
            bool: True if SMS sent successfully, False otherwise
        """
        if not self.is_configured:
            logger.warning("SMS service not configured - password reset OTP not sent")
            return False
        
        try:
            # Format the message
            if username:
                message_body = f"Hi {username}! Your Job Alert password reset code is: {otp}. This code will expire in 10 minutes."
            else:
                message_body = f"Your Job Alert password reset code is: {otp}. This code will expire in 10 minutes."
            
            # Send SMS
            message = self.client.messages.create(
                body=message_body,
                from_=self.from_number,
                to=mobile_number
            )
            
            logger.info(f"Password reset SMS sent successfully to {mobile_number}, SID: {message.sid}")
            return True
            
        except TwilioException as e:
            logger.error(f"Twilio error sending password reset SMS to {mobile_number}: {e}")
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending password reset SMS to {mobile_number}: {e}")
            return False

# Global SMS service instance
sms_service = SMSService()

def send_mobile_verification_sms(mobile_number: str, otp: str, username: str = None) -> bool:
    """
    Convenience function to send mobile verification SMS
    
    Args:
        mobile_number: User's mobile number (with country code)
        otp: 6-digit OTP code
        username: User's username (optional)
    
    Returns:
        bool: True if SMS sent successfully, False otherwise
    """
    return sms_service.send_otp(mobile_number, otp, username)

def send_mobile_password_reset_sms(mobile_number: str, otp: str, username: str = None) -> bool:
    """
    Convenience function to send mobile password reset SMS
    
    Args:
        mobile_number: User's mobile number (with country code)
        otp: 6-digit OTP code
        username: User's username (optional)
    
    Returns:
        bool: True if SMS sent successfully, False otherwise
    """
    return sms_service.send_password_reset_otp(mobile_number, otp, username)
