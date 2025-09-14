from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class JobAlert(Base):
    __tablename__ = "job_alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    keywords = Column(JSON, nullable=True)  # List of keywords to search for
    location = Column(String(255), nullable=True)
    job_type = Column(String(50), nullable=True)  # Full-time, Part-time, Contract, Internship
    experience_level = Column(String(50), nullable=True)  # Entry, Mid, Senior, Executive
    salary_min = Column(Integer, nullable=True)
    salary_max = Column(Integer, nullable=True)
    is_remote = Column(Boolean, nullable=True)
    is_active = Column(Boolean, default=True)
    frequency = Column(String(50), default="daily")  # daily, weekly, monthly
    last_sent = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="job_alerts")

    def __repr__(self):
        return f"<JobAlert(id={self.id}, name='{self.name}', user_id={self.user_id})>"
