from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class JobApplicationBase(BaseModel):
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None


class JobApplicationCreate(JobApplicationBase):
    job_id: int


class JobApplicationUpdate(BaseModel):
    status: Optional[str] = None
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None


class JobApplicationResponse(JobApplicationBase):
    id: int
    user_id: int
    job_id: int
    status: str
    applied_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
