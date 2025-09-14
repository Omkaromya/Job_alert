from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api import deps
from app.crud.user import user
from app.schemas.user import UserUpdate, UserResponse, ProfileCreate, ProfileResponse, ProfileData, FullProfileResponse, ProfileStatusUpdate
from app.database import get_db
from app.models.user import User

router = APIRouter()

def admin_required(current_user: User = Depends(deps.get_current_active_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user

@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: User = Depends(admin_required),
):
    query = db.query(User)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.email.ilike(search_term)) |
            (User.username.ilike(search_term)) |
            (User.full_name.ilike(search_term)) |
            (User.role.ilike(search_term))
        )
    users = query.offset(skip).limit(limit).all()
    return users

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    db_user = user.get(db, id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    updated_user = user.update(db, db_obj=db_user, obj_in=user_in)
    return updated_user

@router.delete("/users/{user_id}", response_model=UserResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    db_user = user.get(db, id=user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    deleted_user = user.delete(db, id=user_id)
    return deleted_user


@router.get("/profile/", response_model=FullProfileResponse)
def read_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
    skip: int = 0,
    limit: int = 100,
) -> FullProfileResponse:
    """
    Get current logged-in user's full profile including detailed profile info.
    """
    profile = user.get_profile(db, user_id=current_user.id)
    profile_data = None
    if profile:
        profile_data = ProfileData(
            full_name=profile.full_name,
            email=profile.email,
            headline=profile.headline,
            current_job_title=profile.current_job_title,
            company=profile.company,
            country=profile.country,
            state=profile.state,
            city=profile.city,
            job_preferences=profile.job_preferences,
            education=profile.education,
            skills=profile.skills,
            projects=profile.projects,
            resume_url=profile.resume_url,
            cover_letter_url=profile.cover_letter_url,
            is_approved=profile.is_approved,
            is_rejected=profile.is_rejected,
            is_deactivated=profile.is_deactivated,
        )
    return FullProfileResponse(user=current_user, profile=profile_data)


@router.put("/profile", response_model=UserResponse)
def update_user_profile(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> User:
    """
    Update current logged-in user's profile.
    """
    updated_user = user.update(db, db_obj=current_user, obj_in=user_in)
    return updated_user


@router.post("/profile", response_model=ProfileResponse)
def save_user_profile(
    profile_in: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """
    Save or update user profile.
    """
    try:
        profile = user.save_profile(db, user_id=current_user.id, profile_in=profile_in)
        profile_data = ProfileData(
            full_name=profile.full_name,
            email=profile.email,
            headline=profile.headline,
            current_job_title=profile.current_job_title,
            company=profile.company,
            country=profile.country,
            state=profile.state,
            city=profile.city,
            location=getattr(profile, "location", None),
            job_preferences=profile.job_preferences,
            education=profile.education,
            skills=profile.skills,
            projects=profile.projects,
            resume_url=profile.resume_url,
            cover_letter_url=profile.cover_letter_url,
            is_approved=profile.is_approved,
            is_rejected=profile.is_rejected,
            is_deactivated=profile.is_deactivated,
        )
        return ProfileResponse(message="Profile saved successfully", profile=profile_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}")


@router.put("/admin/profile/{user_id}/status", response_model=ProfileResponse)
def update_profile_status(
    user_id: int,
    status_update: ProfileStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(admin_required),
):
    """
    Admin endpoint to update profile status: approve, reject, deactivate.
    """
    profile = user.update_profile_status(
        db,
        user_id=user_id,
        is_approved=status_update.is_approved,
        is_rejected=status_update.is_rejected,
        is_deactivated=status_update.is_deactivated,
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile_data = ProfileData(
        full_name=profile.full_name,
        email=profile.email,
        headline=profile.headline,
        current_job_title=profile.current_job_title,
        company=profile.company,
        country=profile.country,
        state=profile.state,
        city=profile.city,
        job_preferences=profile.job_preferences,
        education=profile.education,
        skills=profile.skills,
        projects=profile.projects,
        resume_url=profile.resume_url,
        cover_letter_url=profile.cover_letter_url,
        is_approved=profile.is_approved,
        is_rejected=profile.is_rejected,
        is_deactivated=profile.is_deactivated,
    )
    return ProfileResponse(message="Profile status updated successfully", profile=profile_data)
