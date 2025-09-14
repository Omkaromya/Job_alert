from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Boolean, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=func.uuid())
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    full_name = Column(String(100), nullable=False)
    mobile_number = Column(String(15), nullable=True)
    location = Column(String(100), nullable=True)
    skills = Column(JSON, nullable=True)  # JSON array of skills
    experience_years = Column(Integer, nullable=True)
    education = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    headline = Column(String(200), nullable=True)
    current_job_title = Column(String(100), nullable=True)
    company = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    resume_url = Column(Text, nullable=True)
    cover_letter_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="profile")
    job_preferences = relationship("JobPreference", back_populates="profile", cascade="all, delete-orphan")
    education_records = relationship("Education", back_populates="profile", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="profile", cascade="all, delete-orphan")
    job_applications = relationship("JobApplication", back_populates="profile", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Profile(id={self.id}, user_id={self.user_id}, full_name='{self.full_name}')>"
