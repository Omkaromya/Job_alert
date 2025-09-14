from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class JobPreference(Base):
    __tablename__ = "job_preferences"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    preferred_job_title = Column(String(100), nullable=True)
    job_location_preferences = Column(String(200), nullable=True)
    employment_type = Column(String(50), nullable=True)  # full-time, part-time, contract, internship
    expected_salary_ctc = Column(String(50), nullable=True)
    notice_period = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    profile = relationship("Profile", back_populates="job_preferences")

    def __repr__(self):
        return f"<JobPreference(id={self.id}, profile_id={self.profile_id}, preferred_job_title='{self.preferred_job_title}')>"
