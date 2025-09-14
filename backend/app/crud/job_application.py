from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.job import JobApplication
from app.schemas.job_application import JobApplicationCreate, JobApplicationUpdate


class CRUDJobApplication:
    def get(self, db: Session, id: int) -> Optional[JobApplication]:
        return db.query(JobApplication).filter(JobApplication.id == id).first()

    def get_by_user(
        self, 
        db: Session, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[JobApplication]:
        return db.query(JobApplication).filter(
            JobApplication.user_id == user_id
        ).offset(skip).limit(limit).all()

    def get_by_job(
        self, 
        db: Session, 
        job_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[JobApplication]:
        return db.query(JobApplication).filter(
            JobApplication.job_id == job_id
        ).offset(skip).limit(limit).all()

    def get_by_user_and_job(
        self, 
        db: Session, 
        user_id: int, 
        job_id: int
    ) -> Optional[JobApplication]:
        return db.query(JobApplication).filter(
            JobApplication.user_id == user_id,
            JobApplication.job_id == job_id
        ).first()

    def create(self, db: Session, obj_in: JobApplicationCreate, user_id: int) -> JobApplication:
        from app.crud.user import user as crud_user

        # Check user profile status before allowing application
        profile = crud_user.get_profile(db, user_id=user_id)
        if not profile:
            raise ValueError("User profile not found")
        if not profile.is_approved or profile.is_deactivated or profile.is_rejected:
            raise ValueError("User profile is not approved or is deactivated/rejected, cannot apply for jobs")

        db_obj = JobApplication(
            user_id=user_id,
            job_id=obj_in.job_id,
            cover_letter=obj_in.cover_letter,
            resume_url=obj_in.resume_url,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: JobApplication, obj_in: JobApplicationUpdate) -> JobApplication:
        update_data = obj_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: int) -> JobApplication:
        obj = db.query(JobApplication).get(id)
        db.delete(obj)
        db.commit()
        return obj


job_application = CRUDJobApplication()
