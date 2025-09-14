from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    posted_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_title = Column(String(200), nullable=False, index=True)
    company_name = Column(String(200), nullable=False)
    industry = Column(String(100), nullable=True)
    employment_type = Column(String(50), nullable=True)  # full-time, part-time, contract, internship
    work_mode = Column(String(50), nullable=True)  # on-site, remote, hybrid
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    experience_required = Column(String(100), nullable=True)
    education_required = Column(String(200), nullable=True)
    skills_required = Column(Text, nullable=True)  # Comma-separated skills
    salary_type = Column(String(20), nullable=True)  # monthly, yearly, hourly
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    job_summary = Column(Text, nullable=True)
    roles_responsibilities = Column(Text, nullable=True)  # Comma-separated roles
    key_requirements = Column(Text, nullable=True)  # Comma-separated requirements
    application_deadline = Column(DateTime(timezone=True), nullable=True)
    how_to_apply = Column(String(50), nullable=True)  # quick_apply, email, website
    number_of_openings = Column(Integer, default=1)
    hiring_manager = Column(String(100), nullable=True)
    recruiter_contact = Column(JSON, nullable=True)  # JSON for contact info
    job_status = Column(String(20), default="active")  # active, inactive, draft, closed
    visibility = Column(String(20), default="public")  # public, private, company_only
    tags = Column(Text, nullable=True)  # Comma-separated tags
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    posted_by_user = relationship("User", back_populates="posted_jobs")
    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="job", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Job(id={self.id}, title='{self.job_title}', company='{self.company_name}')>"


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    application_status = Column(String(50), default="applied")  # applied, under_review, shortlisted, interviewed, rejected, hired
    cover_letter = Column(Text, nullable=True)
    resume_url = Column(Text, nullable=True)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    notes = Column(Text, nullable=True)

    # Relationships
    job = relationship("Job", back_populates="applications")
    candidate = relationship("User", back_populates="applications")
    profile = relationship("Profile", back_populates="job_applications")

    def __repr__(self):
        return f"<JobApplication(id={self.id}, job_id={self.job_id}, candidate_id={self.candidate_id})>"
