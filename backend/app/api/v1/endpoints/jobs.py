from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.api import deps
from app.database import get_db
from app.models.user import User
from app.models.job import Job
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobList, JobSearchParams
from app.schemas.notification import NotificationCreate
from app.crud.notification import notification as notification_crud

router = APIRouter()


@router.get("/", response_model=List[JobResponse])
def read_jobs(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    search: Optional[str] = Query(None, description="Search keywords"),
    location: Optional[str] = Query(None, description="Job location"),
    experience: Optional[str] = Query(None, description="Experience level"),
    job_type: Optional[str] = Query(None, description="Job type"),
    work_mode: Optional[str] = Query(None, description="Work mode"),
    industry: Optional[str] = Query(None, description="Industry"),
    salary_min: Optional[float] = Query(None, description="Minimum salary"),
    salary_max: Optional[float] = Query(None, description="Maximum salary"),
) -> Any:
    """
    Retrieve jobs with search and filtering.
    """
    skip = (page - 1) * size
    
    # Build query
    query = db.query(Job).filter(Job.is_active == True)
    
    # Apply filters
    if search:
        search_filter = or_(
            Job.job_title.ilike(f"%{search}%"),
            Job.company_name.ilike(f"%{search}%"),
            Job.job_summary.ilike(f"%{search}%"),
            Job.skills_required.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if location:
        location_filter = or_(
            Job.city.ilike(f"%{location}%"),
            Job.state.ilike(f"%{location}%"),
            Job.country.ilike(f"%{location}%")
        )
        query = query.filter(location_filter)
    
    if experience:
        query = query.filter(Job.experience_required.ilike(f"%{experience}%"))
    
    if job_type:
        query = query.filter(Job.employment_type == job_type)
    
    if work_mode:
        query = query.filter(Job.work_mode == work_mode)
    
    if industry:
        query = query.filter(Job.industry.ilike(f"%{industry}%"))
    
    if salary_min is not None:
        query = query.filter(Job.salary_max >= salary_min)
    
    if salary_max is not None:
        query = query.filter(Job.salary_min <= salary_max)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    jobs = query.offset(skip).limit(size).all()
    
    return jobs


@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    *,
    db: Session = Depends(get_db),
    job_in: JobCreate,
    current_user: User = Depends(deps.get_admin_user),
) -> Any:
    """
    Create new job. Only admins can create jobs.
    """
    # Create job with posted_by field
    job_data = job_in.dict()
    job_data["posted_by"] = current_user.id
    
    job_obj = Job(**job_data)
    db.add(job_obj)
    db.commit()
    db.refresh(job_obj)

    # Create notifications for all candidates
    candidates = db.query(User).filter(User.role != "admin", User.is_active == True).all()
    for candidate in candidates:
        notification_crud.create(
            db,
            obj_in=NotificationCreate(
                user_id=candidate.id,
                title="New Job Posted",
                message=f"A new job '{job_obj.job_title}' has been posted by {job_obj.company_name}. Check it out!",
                notification_type="job_posted",
                related_job_id=job_obj.id,
            )
        )
    
    return job_obj


@router.get("/{job_id}", response_model=JobResponse)
def read_job(
    *,
    db: Session = Depends(get_db),
    job_id: int,
) -> Any:
    """
    Get job by ID.
    """
    job_obj = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()
    if not job_obj:
        raise HTTPException(status_code=404, detail="Job not found")
    return job_obj


@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    *,
    db: Session = Depends(get_db),
    job_id: int,
    job_in: JobUpdate,
    current_user: User = Depends(deps.get_admin_user),
) -> Any:
    """
    Update job. Only admins can update.
    """
    job_obj = db.query(Job).filter(Job.id == job_id).first()
    if not job_obj:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Only admins can edit jobs (no additional checks needed since dependency already ensures admin role)
    
    # Update job
    update_data = job_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job_obj, field, value)
    
    db.commit()
    db.refresh(job_obj)
    return job_obj


@router.delete("/{job_id}")
def delete_job(
    *,
    db: Session = Depends(get_db),
    job_id: int,
    current_user: User = Depends(deps.get_admin_user),
) -> Any:
    """
    Delete job. Only admins can delete.
    """
    job_obj = db.query(Job).filter(Job.id == job_id).first()
    if not job_obj:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Only admins can delete jobs (no additional checks needed since dependency already ensures admin role)
    
    # Soft delete - set is_active to False
    job_obj.is_active = False
    db.commit()
    
    return {"message": "Job deleted successfully"}


@router.get("/my-jobs/", response_model=List[JobResponse])
def get_my_jobs(
    current_user: User = Depends(deps.get_admin_user),
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
) -> Any:
    """
    Get jobs posted by the current user. Only admins can access.
    """
    skip = (page - 1) * size
    
    jobs = db.query(Job).filter(
        Job.posted_by == current_user.id
    ).offset(skip).limit(size).all()
    
    return jobs


@router.get("/admin/dashboard")
def admin_job_dashboard(
    current_user: User = Depends(deps.get_admin_user),
    db: Session = Depends(get_db),
) -> Any:
    """
    Admin dashboard - only accessible by admin users.
    """
    total_jobs = db.query(Job).count()
    active_jobs = db.query(Job).filter(Job.is_active == True).count()
    inactive_jobs = db.query(Job).filter(Job.is_active == False).count()
    
    return {
        "message": "Welcome to Admin Dashboard",
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "role": current_user.role,
            "is_superuser": current_user.is_superuser
        },
        "dashboard_data": {
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
            "inactive_jobs": inactive_jobs
        }
    }

