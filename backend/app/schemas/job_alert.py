from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class JobAlertBase(BaseModel):
    name: str
    keywords: Optional[List[str]] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    is_remote: Optional[bool] = None
    frequency: str = "daily"


class JobAlertCreate(JobAlertBase):
    pass


class JobAlertUpdate(BaseModel):
    name: Optional[str] = None
    keywords: Optional[List[str]] = None
    location: Optional[str] = None
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    is_remote: Optional[bool] = None
    frequency: Optional[str] = None
    is_active: Optional[bool] = None


class JobAlertResponse(JobAlertBase):
    id: int
    user_id: int
    is_active: bool
    last_sent: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
