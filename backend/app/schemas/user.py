from pydantic import BaseModel, EmailStr, field_validator, model_validator, ConfigDict
from typing import Optional, Union
from datetime import datetime
import re


class UserBase(BaseModel):
    email: Optional[Union[EmailStr, str]] = None
    username: str
    full_name: Optional[str] = None
    role: Optional[str] = "user"
    mobile_number: Optional[str] = None


class UserCreate(UserBase):
    password: str

    model_config = ConfigDict(extra='allow')

    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        # Convert empty string to None
        if v == "":
            return None
        # If it's a valid email string, validate it
        if v is not None:
            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_regex, v):
                raise ValueError('Invalid email format')
        return v
    
    @field_validator('mobile_number')
    @classmethod
    def validate_mobile_number(cls, v):
        # Convert empty string to None
        if v == "":
            return None
        return v
    
    @model_validator(mode='after')
    def validate_email_or_mobile(self):
        # Ensure either email or mobile_number is provided
        if not self.email and not self.mobile_number:
            raise ValueError('Either email or mobile_number must be provided')
        return self


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    mobile_number: Optional[str] = None


class UserInDB(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    role: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserResponse(UserBase):
    id: int
    is_active: bool
    role: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class EmailVerification(BaseModel):
    email: EmailStr
    otp: str


class EmailVerificationResponse(BaseModel):
    message: str
    verified: bool


class ResendOTP(BaseModel):
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str


class ResetPasswordRequest(BaseModel):
    # token: str
    new_password: str
    confirm_password: str


class ForgotPasswordOTPRequest(BaseModel):
    email: EmailStr


class ForgotPasswordOTPResponse(BaseModel):
    message: str


class ResetPasswordOTPRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str
    confirm_password: str


class ResetPasswordOTPResponse(BaseModel):
    message: str


class ResetPasswordResponse(BaseModel):
    message: str


class UserRoleResponse(BaseModel):
    user_id: int
    email: str
    username: str
    role: str
    is_superuser: bool
    is_active: bool


class RoleCheckResponse(BaseModel):
    user_id: int
    email: str
    username: str
    current_role: str
    required_role: str
    has_required_role: bool
    is_superuser: bool
    access_granted: bool


class EmailCheckRequest(BaseModel):
    email: EmailStr


class EmailCheckResponse(BaseModel):
    exists: bool
    message: str


# Mobile Authentication Schemas
class MobileVerification(BaseModel):
    mobile_number: str
    otp: str


class MobileVerificationResponse(BaseModel):
    message: str
    verified: bool


class MobileLogin(BaseModel):
    mobile_number: str
    otp: str


class MobileLoginResponse(BaseModel):
    access_token: str
    token_type: str


class MobileResendOTP(BaseModel):
    mobile_number: str


class MobileForgotPasswordRequest(BaseModel):
    mobile_number: str


class MobileForgotPasswordResponse(BaseModel):
    message: str


class MobileResetPasswordRequest(BaseModel):
    mobile_number: str
    otp: str
    new_password: str
    confirm_password: str


class MobileResetPasswordResponse(BaseModel):
    message: str


# Profile Schemas
class JobPreferences(BaseModel):
    preferred_job_title: Optional[str] = None
    job_location_preferences: Optional[str] = None
    employment_type: Optional[str] = None
    expected_salary_ctc: Optional[str] = None
    notice_period: Optional[str] = None


class EducationItem(BaseModel):
    degree_qualification: Optional[str] = None
    institution: Optional[str] = None
    field_of_study: Optional[str] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None


class ProjectItem(BaseModel):
    project_title: Optional[str] = None
    live_github_link: Optional[str] = None
    description: Optional[str] = None


class ProfileCreate(BaseModel):
    full_name: str
    mobile_number: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[list[str]] = None
    experience_years: Optional[int] = None
    education: Optional[str] = None
    bio: Optional[str] = None
    headline: Optional[str] = None
    current_job_title: Optional[str] = None
    company: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    resume_url: Optional[str] = None
    cover_letter_url: Optional[str] = None
    is_active: Optional[bool] = True


class ProfileData(BaseModel):
    full_name: str
    email: str
    headline: Optional[str] = None
    current_job_title: Optional[str] = None
    company: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    location: Optional[str] = None
    job_preferences: Optional[JobPreferences] = None
    education: Optional[list[EducationItem]] = None
    skills: Optional[list[str]] = None
    projects: Optional[list[ProjectItem]] = None
    resume_url: Optional[str] = None
    cover_letter_url: Optional[str] = None
    is_approved: Optional[bool] = False
    is_rejected: Optional[bool] = False
    is_deactivated: Optional[bool] = False


class FullProfileResponse(BaseModel):
    user: UserResponse
    profile: Optional[ProfileData] = None

    class Config:
        from_attributes = True

class ProfileResponse(BaseModel):
    message: str
    profile: ProfileData


class ProfileStatusUpdate(BaseModel):
    is_approved: Optional[bool] = None
    is_rejected: Optional[bool] = None
    is_deactivated: Optional[bool] = None
