from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(150), unique=True, index=True, nullable=False)
    email = Column(String(254), nullable=True, index=True)
    password_hash = Column(String(128), nullable=False)
    first_name = Column(String(150), nullable=True)
    last_name = Column(String(150), nullable=True)
    is_active = Column(Boolean, default=True)
    is_staff = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    role = Column(String(50), default="user", nullable=False)
    date_joined = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    email_verified = Column(Boolean, default=False)
    verification_token = Column(String(255), nullable=True)
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    otp = Column(String(6), nullable=True)
    otp_expires_at = Column(DateTime(timezone=True), nullable=True)
    mobile_number = Column(String(15), nullable=True, index=True)
    mobile_otp = Column(String(6), nullable=True)
    mobile_otp_expires_at = Column(DateTime(timezone=True), nullable=True)
    password_reset_otp = Column(String(6), nullable=True)
    password_reset_otp_expires_at = Column(DateTime(timezone=True), nullable=True)
    mobile_password_reset_otp = Column(String(6), nullable=True)
    mobile_password_reset_otp_expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    job_alerts = relationship("JobAlert", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("JobApplication", back_populates="candidate", cascade="all, delete-orphan")
    posted_jobs = relationship("Job", back_populates="posted_by_user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', username='{self.username}')>"
