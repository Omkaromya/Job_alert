from datetime import timedelta, datetime, timezone
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.api import deps
from app.core.security import create_access_token
from app.crud.user import user
from app.database import get_db
from app.schemas.user import UserResponse, UserCreate, Token, EmailVerification, EmailVerificationResponse, ResendOTP, UserRoleResponse, RoleCheckResponse, ForgotPasswordRequest, ForgotPasswordResponse, ResetPasswordRequest, ResetPasswordResponse, ForgotPasswordOTPRequest, ForgotPasswordOTPResponse, ResetPasswordOTPRequest, ResetPasswordOTPResponse, EmailCheckRequest, EmailCheckResponse, MobileVerification, MobileVerificationResponse, MobileLogin, MobileLoginResponse, MobileResendOTP, MobileForgotPasswordRequest, MobileForgotPasswordResponse, MobileResetPasswordRequest, MobileResetPasswordResponse
from app.models.user import User
from app.config import settings
from app.core.email import send_verification_email, send_password_reset_email, send_password_reset_otp_email
from app.core.sms import send_mobile_verification_sms, send_mobile_password_reset_sms
from app.core.security import generate_otp, create_password_reset_token, verify_password_reset_token

router = APIRouter()


@router.post("/register", response_model=dict)
def create_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    
    # Check if email is provided and if user with that email exists
    if user_in.email and user_in.email.strip():
        user_obj = user.get_by_email(db, email=user_in.email)
        if user_obj:
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system.",
            )
    
    # Check if mobile number is provided and if user with that mobile exists
    if user_in.mobile_number:
        user_obj = user.get_by_mobile(db, mobile_number=user_in.mobile_number)
        if user_obj:
            raise HTTPException(
                status_code=400,
                detail="The user with this mobile number already exists in the system.",
            )
    
    # Check if username already exists
    user_obj = user.get_by_username(db, username=user_in.username)
    if user_obj:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    # Create user (will be inactive until verified)
    user_obj = user.create(db, obj_in=user_in)
    
    # Generate OTP
    otp = generate_otp()
    otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    # Send OTP based on what's provided
    if user_in.email and user_in.email.strip():
        # Store OTP for email verification
        user_obj.otp = otp
        user_obj.otp_expires_at = otp_expires_at
        db.commit()
        db.refresh(user_obj)
        
        # Send email OTP
        email_sent = send_verification_email(user_in.email, otp, user_in.username)
        
        if not email_sent:
            user.delete(db, id=user_obj.id)
            raise HTTPException(
                status_code=500,
                detail="Failed to send verification email. Please try again.",
            )
        
        return {
            "message": "User registered successfully. Please check your email to verify your account.",
            "user_id": user_obj.id,
            "email": user_obj.email,
            "verification_method": "email"
        }
    
    elif user_in.mobile_number:
        # Store OTP for mobile verification
        user_obj.mobile_otp = otp
        user_obj.mobile_otp_expires_at = otp_expires_at
        db.commit()
        db.refresh(user_obj)
        
        # Send SMS OTP
        sms_sent = send_mobile_verification_sms(user_in.mobile_number, otp, user_in.username)
        
        if not sms_sent:
            # SMS service not configured or failed, but OTP is stored in database
            return {
                "message": "User registered successfully. SMS service not configured. Please contact support or try email verification.",
                "user_id": user_obj.id,
                "mobile_number": user_obj.mobile_number,
                "verification_method": "mobile",
                "otp": otp,  # For development/testing purposes
                "warning": "SMS service not available"
            }
        
        return {
            "message": "User registered successfully. Please check your mobile for verification OTP.",
            "user_id": user_obj.id,
            "mobile_number": user_obj.mobile_number,
            "verification_method": "mobile"
        }


@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    
    user_obj = user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    elif not user.is_active(user_obj):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Account not verified. Please check your email and verify your account."
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user_obj.email, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.get("/me", response_model=UserResponse)
def read_users_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    # Get current user.
   
    return current_user


@router.post("/verify", response_model=dict)
def verify_user(
    verification_data: dict,
    db: Session = Depends(get_db),
) -> Any:
    """
    Unified verification endpoint for both email and mobile OTP
    Expected payload: {"email": "user@example.com", "otp": "123456"} OR {"mobile_number": "+1234567890", "otp": "123456"}
    """
    email = verification_data.get("email")
    mobile_number = verification_data.get("mobile_number")
    otp = verification_data.get("otp")
    
    if not otp:
        raise HTTPException(
            status_code=400,
            detail="OTP is required.",
        )
    
    if not email and not mobile_number:
        raise HTTPException(
            status_code=400,
            detail="Either email or mobile_number is required.",
        )
    
    if email and mobile_number:
        raise HTTPException(
            status_code=400,
            detail="Please provide either email or mobile_number, not both.",
        )
    
    # Get the user
    if email:
        user_obj = user.get_by_email(db, email=email)
        verification_method = "email"
    else:
        user_obj = user.get_by_mobile(db, mobile_number=mobile_number)
        verification_method = "mobile"
    
    if not user_obj:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )
    
    # Check if already verified
    if user_obj.is_active:
        return {
            "message": f"{verification_method.capitalize()} already verified.",
            "verified": True
        }
    
    # Check OTP based on verification method
    if verification_method == "email":
        if not user_obj.otp or not user_obj.otp_expires_at:
            raise HTTPException(
                status_code=400,
                detail="No OTP found. Please request a new OTP.",
            )
        
        # Check if OTP has expired
        now_utc = datetime.now(timezone.utc)
        otp_expires_at = user_obj.otp_expires_at
        if otp_expires_at.tzinfo is None:
            otp_expires_at = otp_expires_at.replace(tzinfo=timezone.utc)
        if now_utc > otp_expires_at:
            raise HTTPException(
                status_code=400,
                detail="OTP has expired. Please request a new OTP.",
            )
        
        # Verify OTP
        if user_obj.otp != otp:
            raise HTTPException(
                status_code=400,
                detail="Invalid OTP. Please check and try again.",
            )
        
        # Activate the user and clear OTP
        user_obj.is_active = True
        user_obj.otp = None
        user_obj.otp_expires_at = None
        db.commit()
        db.refresh(user_obj)
        
    else:  # mobile verification
        if not user_obj.mobile_otp or not user_obj.mobile_otp_expires_at:
            raise HTTPException(
                status_code=400,
                detail="No OTP found. Please request a new OTP.",
            )
        
        # Check if OTP has expired
        now_utc = datetime.now(timezone.utc)
        otp_expires_at = user_obj.mobile_otp_expires_at
        if otp_expires_at.tzinfo is None:
            otp_expires_at = otp_expires_at.replace(tzinfo=timezone.utc)
        if now_utc > otp_expires_at:
            raise HTTPException(
                status_code=400,
                detail="OTP has expired. Please request a new OTP.",
            )
        
        # Verify OTP
        if user_obj.mobile_otp != otp:
            raise HTTPException(
                status_code=400,
                detail="Invalid OTP. Please check and try again.",
            )
        
        # Activate the user and clear OTP
        user_obj.is_active = True
        user_obj.mobile_otp = None
        user_obj.mobile_otp_expires_at = None
        db.commit()
        db.refresh(user_obj)
    
    return {
        "message": f"{verification_method.capitalize()} verified successfully. You can now log in.",
        "verified": True,
        "verification_method": verification_method
    }


@router.post("/verify-email", response_model=EmailVerificationResponse)
def verify_email(
    verification_data: EmailVerification,
    db: Session = Depends(get_db),
) -> Any:
   
    email = verification_data.email
    otp = verification_data.otp
    
    # Get the user
    user_obj = user.get_by_email(db, email=email)
    if not user_obj:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )
    
    
    if user_obj.is_active:
        return EmailVerificationResponse(
            message="Email already verified.",
            verified=True
        )
    
    
    if not user_obj.otp or not user_obj.otp_expires_at:
        raise HTTPException(
            status_code=400,
            detail="No OTP found. Please request a new OTP.",
        )
    
    # Check if OTP has expired (normalize timezone to avoid naive vs aware errors)
    now_utc = datetime.now(timezone.utc)
    otp_expires_at = user_obj.otp_expires_at
    if otp_expires_at.tzinfo is None:
        otp_expires_at = otp_expires_at.replace(tzinfo=timezone.utc)
    if now_utc > otp_expires_at:
        raise HTTPException(
            status_code=400,
            detail="OTP has expired. Please request a new OTP.",
        )
    
    # Verify OTP
    if user_obj.otp != otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP. Please check and try again.",
        )
    
    # Activate the user and clear OTP
    user_obj.is_active = True
    user_obj.otp = None
    user_obj.otp_expires_at = None
    db.commit()
    db.refresh(user_obj)
    
    return EmailVerificationResponse(
        message="Email verified successfully. You can now log in.",
        verified=True
    )


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(
    forgot_data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> Any:
    """
    Send password reset email.
    """
    email = forgot_data.email
    user_obj = user.get_by_email(db, email=email)
    
    if not user_obj:
        # Don't reveal if user exists or not for security
        return ForgotPasswordResponse(message="If the email exists, a password reset link has been sent.")
    
    # Check if user is active
    if not user_obj.is_active:
        return ForgotPasswordResponse(message="If the email exists, a password reset link has been sent.")
    
    # Generate password reset token and send email
    reset_token = create_password_reset_token(email)
    email_sent = send_password_reset_email(email, reset_token, user_obj.username)
    
    if not email_sent:
        raise HTTPException(
            status_code=500,
            detail="Failed to send password reset email. Please try again.",
        )
    
    return ForgotPasswordResponse(message="If the email exists, a password reset link has been sent.")


@router.post("/reset-password", response_model=ResetPasswordResponse)
def reset_password(
    reset_data: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> Any:
    """
    Reset password using token.
    """
    # Validate password confirmation
    if reset_data.new_password != reset_data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match."
        )
    
    # Validate password strength
    if len(reset_data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long."
        )
    
    # Verify the token
    email = verify_password_reset_token(reset_data.token)
    if not email:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token.",
        )
    
    # Get the user
    user_obj = user.get_by_email(db, email=email)
    if not user_obj:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )
    
    # Check if user is active
    if not user_obj.is_active:
        raise HTTPException(
            status_code=400,
            detail="Account is not active. Please verify your email first.",
        )
    
    # Update password
    from app.core.security import get_password_hash
    user_obj.password_hash = get_password_hash(reset_data.new_password)
    db.commit()
    db.refresh(user_obj)
    
    return ResetPasswordResponse(message="Password reset successfully.")


@router.get("/verify-reset-token/{token}")
def verify_reset_token(
    token: str,
) -> Any:
    """
    Verify if a password reset token is valid.
    """
    email = verify_password_reset_token(token)
    if not email:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token.",
        )
    
    return {"message": "Token is valid", "email": email}


@router.post("/resend-otp")
def resend_otp_unified(
    resend_data: dict,
    db: Session = Depends(get_db),
) -> Any:
    """
    Unified resend OTP endpoint for both email and mobile
    Expected payload: {"email": "user@example.com"} OR {"mobile_number": "+1234567890"}
    """
    try:
        email = resend_data.get("email")
        mobile_number = resend_data.get("mobile_number")
        
        # Convert empty strings to None
        if email == "":
            email = None
        if mobile_number == "":
            mobile_number = None
        
        if not email and not mobile_number:
            raise HTTPException(
                status_code=400,
                detail="Either email or mobile_number is required.",
            )
        
        if email and mobile_number:
            raise HTTPException(
                status_code=400,
                detail="Please provide either email or mobile_number, not both.",
            )
        
        # Get the user
        if email and email.strip():
            user_obj = user.get_by_email(db, email=email)
            verification_method = "email"
        else:
            user_obj = user.get_by_mobile(db, mobile_number=mobile_number)
            verification_method = "mobile"
        
        if not user_obj:
            raise HTTPException(
                status_code=404,
                detail="User not found.",
            )
        
        # Check if already verified
        if user_obj.is_active:
            raise HTTPException(
                status_code=400,
                detail=f"{verification_method.capitalize()} is already verified.",
            )
        
        # Generate new OTP
        otp = generate_otp()
        otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        
        # Update OTP based on verification method
        if verification_method == "email":
            user_obj.otp = otp
            user_obj.otp_expires_at = otp_expires_at
            db.commit()
            db.refresh(user_obj)
            
            # Send new OTP email
            email_sent = send_verification_email(email, otp, user_obj.username)
            
            if not email_sent:
                raise HTTPException(
                    status_code=500,
                    detail="Failed to send OTP email. Please try again.",
                )
            
            return {"message": "OTP sent successfully. Please check your email."}
        
        else:  # mobile
            user_obj.mobile_otp = otp
            user_obj.mobile_otp_expires_at = otp_expires_at
            db.commit()
            db.refresh(user_obj)
            
            # Send SMS OTP
            sms_sent = send_mobile_verification_sms(mobile_number, otp, user_obj.username)
            
            if not sms_sent:
                # SMS service not configured or failed, but OTP is stored in database
                return {
                    "message": "OTP generated successfully. SMS service not configured. Please contact support or try email verification.",
                    "otp": otp,  # For development/testing purposes
                    "warning": "SMS service not available"
                }
            
            return {"message": "OTP sent successfully. Please check your mobile."}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/resend-otp-email")
def resend_otp(
    resend_data: ResendOTP,
    db: Session = Depends(get_db),
) -> Any:
    """
    Resend OTP for email verification.
    """
    email = resend_data.email
    
    # Get the user
    user_obj = user.get_by_email(db, email=email)
    if not user_obj:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )
    
    # Check if already verified
    if user_obj.is_active:
        raise HTTPException(
            status_code=400,
            detail="Email is already verified.",
        )
    
    # Generate new OTP
    otp = generate_otp()
    otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)  # OTP expires in 10 minutes
    
    # Update OTP in user record
    user_obj.otp = otp
    user_obj.otp_expires_at = otp_expires_at
    db.commit()
    db.refresh(user_obj)
    
    # Send new OTP email
    email_sent = send_verification_email(email, otp, user_obj.username)
    
    if not email_sent:
        raise HTTPException(
            status_code=500,
            detail="Failed to send OTP email. Please try again.",
        )
    
    return {"message": "OTP sent successfully. Please check your email."}


@router.get("/my-role", response_model=UserRoleResponse)
def get_current_user_role(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user's role.
    """
    return UserRoleResponse(
        user_id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        role=current_user.role,
        is_superuser=current_user.is_superuser,
        is_active=current_user.is_active
    )


@router.get("/check-role/{required_role}", response_model=RoleCheckResponse)
def check_user_role(
    required_role: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Check if current user has the required role.
    """
    has_role = current_user.role == required_role
    is_superuser = current_user.is_superuser
    
    # Superusers have access to everything
    if is_superuser:
        has_role = True
    
    return RoleCheckResponse(
        user_id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        current_role=current_user.role,
        required_role=required_role,
        has_required_role=has_role,
        is_superuser=is_superuser,
        access_granted=has_role
    )


@router.post("/forgot-password-otp", response_model=ForgotPasswordOTPResponse)
def forgot_password_otp(
    forgot_data: ForgotPasswordOTPRequest,
    db: Session = Depends(get_db),
) -> Any:
    """
    Send password reset OTP email.
    """
    email = forgot_data.email
    user_obj = user.get_by_email(db, email=email)
    
    if not user_obj:
        # Don't reveal if user exists or not for security
        return ForgotPasswordOTPResponse(message="If the email exists, a password reset OTP has been sent.")
    
    # Check if user is active
    if not user_obj.is_active:
        return ForgotPasswordOTPResponse(message="If the email exists, a password reset OTP has been sent.")
    
    # Generate password reset OTP
    otp = generate_otp()
    otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)  # OTP expires in 10 minutes
    
    # Store OTP in user record
    user_obj.password_reset_otp = otp
    user_obj.password_reset_otp_expires_at = otp_expires_at
    db.commit()
    db.refresh(user_obj)
    
    # Send OTP email
    email_sent = send_password_reset_otp_email(email, otp, user_obj.username)
    
    if not email_sent:
        raise HTTPException(
            status_code=500,
            detail="Failed to send OTP email. Please try again.",
        )
    
    return ForgotPasswordOTPResponse(message="If the email exists, a password reset OTP has been sent.")


@router.post("/reset-password-otp", response_model=ResetPasswordOTPResponse)
def reset_password_otp(
    reset_data: ResetPasswordOTPRequest,
    db: Session = Depends(get_db),
) -> Any:
    """
    Reset password using OTP.
    """
    # Validate password confirmation
    if reset_data.new_password != reset_data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match."
        )
    
    # Validate password strength
    if len(reset_data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long."
        )
    
    # Get the user
    user_obj = user.get_by_email(db, email=reset_data.email)
    if not user_obj:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )
    
    # Check if user is active
    if not user_obj.is_active:
        raise HTTPException(
            status_code=400,
            detail="Account is not active. Please verify your email first.",
        )
    
    # Check if OTP exists and is valid
    if not user_obj.password_reset_otp or not user_obj.password_reset_otp_expires_at:
        raise HTTPException(
            status_code=400,
            detail="No OTP found. Please request a new OTP.",
        )
    
    # Check if OTP has expired
    now_utc = datetime.now(timezone.utc)
    otp_expires_at = user_obj.password_reset_otp_expires_at
    if otp_expires_at.tzinfo is None:
        otp_expires_at = otp_expires_at.replace(tzinfo=timezone.utc)
    if now_utc > otp_expires_at:
        raise HTTPException(
            status_code=400,
            detail="OTP has expired. Please request a new OTP.",
        )
    
    # Verify OTP
    if user_obj.password_reset_otp != reset_data.otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP. Please check and try again.",
        )
    
    # Update password and clear OTP
    from app.core.security import get_password_hash
    user_obj.password_hash = get_password_hash(reset_data.new_password)
    user_obj.password_reset_otp = None
    user_obj.password_reset_otp_expires_at = None
    db.commit()
    db.refresh(user_obj)
    
    return ResetPasswordOTPResponse(message="Password reset successfully.")


@router.post("/check-email", response_model=EmailCheckResponse)
def check_email(
    check_data: EmailCheckRequest,
    db: Session = Depends(get_db),
) -> Any:
    """
    Check if an email is already registered.
    """
    email = check_data.email
    user_obj = user.get_by_email(db, email=email)
    if user_obj:
        return EmailCheckResponse(
            exists=True,
            message="Email is already registered."
        )
    else:
        return EmailCheckResponse(
            exists=False,
            message="Email is available."
        )


# Mobile Authentication Endpoints

@router.post("/mobile-register", response_model=dict)
def create_user_mobile(
    *,
    db: Session = Depends(get_db),
    user_in: UserCreate,
) -> Any:
    if not user_in.mobile_number:
        raise HTTPException(
            status_code=400,
            detail="Mobile number is required for mobile registration.",
        )

    user_obj = user.get_by_mobile(db, mobile_number=user_in.mobile_number)
    if user_obj:
        raise HTTPException(
            status_code=400,
            detail="The user with this mobile number already exists in the system.",
        )
    user_obj = user.get_by_username(db, username=user_in.username)
    if user_obj:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )

    
    user_obj = user.create(db, obj_in=user_in)

    # Generate OTP and send SMS
    otp = generate_otp()
    otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)  # OTP expires in 10 minutes

    # Store OTP in user record
    user_obj.mobile_otp = otp
    user_obj.mobile_otp_expires_at = otp_expires_at
    db.commit()
    db.refresh(user_obj)

    # 
    return {
        "message": "User registered successfully. Please check your mobile for verification OTP.",
        "user_id": user_obj.id,
        "mobile_number": user_obj.mobile_number
    }


@router.post("/mobile-login", response_model=MobileLoginResponse)
def login_mobile(
    db: Session = Depends(get_db), login_data: MobileLogin = Depends()
) -> Any:
    """
    Mobile OTP login, get an access token for future requests.
    """
    user_obj = user.authenticate_by_mobile(
        db, mobile_number=login_data.mobile_number, otp=login_data.otp
    )
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect mobile number or OTP",
        )
    elif not user.is_active(user_obj):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account not verified. Please verify your mobile number."
        )

    # Clear the OTP after successful login
    user_obj.mobile_otp = None
    user_obj.mobile_otp_expires_at = None
    db.commit()

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            user_obj.email, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/verify-mobile", response_model=MobileVerificationResponse)
def verify_mobile(
    verification_data: MobileVerification,
    db: Session = Depends(get_db),
) -> Any:
    """
    Verify user mobile number using OTP.
    """
    mobile_number = verification_data.mobile_number
    otp = verification_data.otp

    # Get the user
    user_obj = user.get_by_mobile(db, mobile_number=mobile_number)
    if not user_obj:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # Check if already verified
    if user_obj.is_active:
        return MobileVerificationResponse(
            message="Mobile number already verified.",
            verified=True
        )

    # Check if OTP exists and is valid
    if not user_obj.mobile_otp or not user_obj.mobile_otp_expires_at:
        raise HTTPException(
            status_code=400,
            detail="No OTP found. Please request a new OTP.",
        )

    # Check if OTP has expired
    now_utc = datetime.now(timezone.utc)
    otp_expires_at = user_obj.mobile_otp_expires_at
    if otp_expires_at.tzinfo is None:
        otp_expires_at = otp_expires_at.replace(tzinfo=timezone.utc)
    if now_utc > otp_expires_at:
        raise HTTPException(
            status_code=400,
            detail="OTP has expired. Please request a new OTP.",
        )

    # Verify OTP
    if user_obj.mobile_otp != otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP. Please check and try again.",
        )

    # Activate the user and clear OTP
    user_obj.is_active = True
    user_obj.mobile_otp = None
    user_obj.mobile_otp_expires_at = None
    db.commit()
    db.refresh(user_obj)

    return MobileVerificationResponse(
        message="Mobile number verified successfully. You can now log in.",
        verified=True
    )


@router.post("/resend-mobile-otp")
def resend_mobile_otp(
    resend_data: MobileResendOTP,
    db: Session = Depends(get_db),
) -> Any:
    """
    Resend OTP for mobile verification.
    """
    mobile_number = resend_data.mobile_number

    # Get the user
    user_obj = user.get_by_mobile(db, mobile_number=mobile_number)
    if not user_obj:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # Check if already verified
    if user_obj.is_active:
        raise HTTPException(
            status_code=400,
            detail="Mobile number is already verified.",
        )

    # Generate new OTP
    otp = generate_otp()
    otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)  # OTP expires in 10 minutes

    # Update OTP in user record
    user_obj.mobile_otp = otp
    user_obj.mobile_otp_expires_at = otp_expires_at
    db.commit()
    db.refresh(user_obj)

    # TODO: Implement SMS sending function
    # sms_sent = send_mobile_verification_sms(mobile_number, otp)

    return {"message": "OTP sent successfully. Please check your mobile."}


@router.post("/forgot-password-mobile", response_model=MobileForgotPasswordResponse)
def forgot_password_mobile(
    forgot_data: MobileForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> Any:
    """
    Send password reset OTP to mobile number.
    """
    mobile_number = forgot_data.mobile_number
    user_obj = user.get_by_mobile(db, mobile_number=mobile_number)

    if not user_obj:
        # Don't reveal if user exists or not for security
        return MobileForgotPasswordResponse(message="If the mobile number exists, a password reset OTP has been sent.")

    # Check if user is active
    if not user_obj.is_active:
        return MobileForgotPasswordResponse(message="If the mobile number exists, a password reset OTP has been sent.")

    # Generate password reset OTP
    otp = generate_otp()
    otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)  # OTP expires in 10 minutes

    # Store OTP in user record
    user_obj.mobile_password_reset_otp = otp
    user_obj.mobile_password_reset_otp_expires_at = otp_expires_at
    db.commit()
    db.refresh(user_obj)

    # Send SMS OTP
    sms_sent = send_mobile_password_reset_sms(mobile_number, otp, user_obj.username)
    
    if not sms_sent:
        raise HTTPException(
            status_code=500,
            detail="Failed to send password reset OTP SMS. Please try again.",
        )

    return MobileForgotPasswordResponse(message="If the mobile number exists, a password reset OTP has been sent.")


@router.post("/reset-password-mobile", response_model=MobileResetPasswordResponse)
def reset_password_mobile(
    reset_data: MobileResetPasswordRequest,
    db: Session = Depends(get_db),
) -> Any:
    """
    Reset password using mobile OTP.
    """
    # Validate password confirmation
    if reset_data.new_password != reset_data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match."
        )

    # Validate password strength
    if len(reset_data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long."
        )

    # Get the user
    user_obj = user.get_by_mobile(db, mobile_number=reset_data.mobile_number)
    if not user_obj:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # Check if user is active
    if not user_obj.is_active:
        raise HTTPException(
            status_code=400,
            detail="Account is not active. Please verify your mobile number first.",
        )

    # Check if OTP exists and is valid
    if not user_obj.mobile_password_reset_otp or not user_obj.mobile_password_reset_otp_expires_at:
        raise HTTPException(
            status_code=400,
            detail="No OTP found. Please request a new OTP.",
        )

    # Check if OTP has expired
    now_utc = datetime.now(timezone.utc)
    otp_expires_at = user_obj.mobile_password_reset_otp_expires_at
    if otp_expires_at.tzinfo is None:
        otp_expires_at = otp_expires_at.replace(tzinfo=timezone.utc)
    if now_utc > otp_expires_at:
        raise HTTPException(
            status_code=400,
            detail="OTP has expired. Please request a new OTP.",
        )

    # Verify OTP
    if user_obj.mobile_password_reset_otp != reset_data.otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP. Please check and try again.",
        )

    # Update password and clear OTP
    from app.core.security import get_password_hash
    user_obj.password_hash = get_password_hash(reset_data.new_password)
    user_obj.mobile_password_reset_otp = None
    user_obj.mobile_password_reset_otp_expires_at = None
    db.commit()
    db.refresh(user_obj)

    return MobileResetPasswordResponse(message="Password reset successfully.")
