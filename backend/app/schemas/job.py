from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class JobBase(BaseModel):
    job_title: str = Field(..., description="Job title")
    company_name: str = Field(..., description="Company name")
    industry: Optional[str] = Field(None, description="Industry")
    employment_type: Optional[str] = Field(None, description="full-time, part-time, contract, internship")
    work_mode: Optional[str] = Field(None, description="on-site, remote, hybrid")
    city: Optional[str] = Field(None, description="City")
    state: Optional[str] = Field(None, description="State")
    country: Optional[str] = Field(None, description="Country")
    experience_required: Optional[str] = Field(None, description="2-5 years, fresher, etc.")
    education_required: Optional[str] = Field(None, description="Bachelor's, Master's, etc.")
    skills_required: Optional[str] = Field(None, description="Comma-separated skills")
    salary_type: Optional[str] = Field(None, description="monthly, yearly, hourly")
    salary_min: Optional[float] = Field(None, description="Minimum salary")
    salary_max: Optional[float] = Field(None, description="Maximum salary")
    job_summary: Optional[str] = Field(None, description="Job summary")
    roles_responsibilities: Optional[str] = Field(None, description="Comma-separated roles")
    key_requirements: Optional[str] = Field(None, description="Comma-separated requirements")
    application_deadline: Optional[datetime] = Field(None, description="Application deadline")
    how_to_apply: Optional[str] = Field(None, description="quick_apply, email, website")
    number_of_openings: Optional[int] = Field(1, description="Number of openings")
    hiring_manager: Optional[str] = Field(None, description="Hiring manager name")
    recruiter_contact: Optional[str] = Field(None, description="Recruiter contact info")
    job_status: Optional[str] = Field("active", description="active, inactive, draft, closed")
    visibility: Optional[str] = Field("public", description="public, private, company_only")
    tags: Optional[str] = Field(None, description="Comma-separated tags")


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    industry: Optional[str] = None
    employment_type: Optional[str] = None
    work_mode: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    experience_required: Optional[str] = None
    education_required: Optional[str] = None
    skills_required: Optional[str] = None
    salary_type: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    job_summary: Optional[str] = None
    roles_responsibilities: Optional[str] = None
    key_requirements: Optional[str] = None
    application_deadline: Optional[datetime] = None
    how_to_apply: Optional[str] = None
    number_of_openings: Optional[int] = None
    hiring_manager: Optional[str] = None
    recruiter_contact: Optional[str] = None
    job_status: Optional[str] = None
    visibility: Optional[str] = None
    tags: Optional[str] = None
    is_active: Optional[bool] = None


class JobResponse(JobBase):
    id: int
    posted_by: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class JobList(BaseModel):
    jobs: List[JobResponse]
    total: int
    page: int
    size: int
    pages: int


class JobSearchParams(BaseModel):
    search: Optional[str] = Field(None, description="Search keywords")
    location: Optional[str] = Field(None, description="Job location")
    experience: Optional[str] = Field(None, description="Experience level")
    job_type: Optional[str] = Field(None, description="Job type")
    work_mode: Optional[str] = Field(None, description="Work mode")
    industry: Optional[str] = Field(None, description="Industry")
    salary_min: Optional[float] = Field(None, description="Minimum salary")
    salary_max: Optional[float] = Field(None, description="Maximum salary")
    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(10, ge=1, le=100, description="Page size")
