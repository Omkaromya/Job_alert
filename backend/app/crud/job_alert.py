from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.job_alert import JobAlert
from app.schemas.job_alert import JobAlertCreate, JobAlertUpdate


class CRUDJobAlert:
    def get(self, db: Session, id: int) -> Optional[JobAlert]:
        return db.query(JobAlert).filter(JobAlert.id == id).first()

    def get_by_user(
        self, 
        db: Session, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> List[JobAlert]:
        query = db.query(JobAlert).filter(JobAlert.user_id == user_id)
        
        if is_active is not None:
            query = query.filter(JobAlert.is_active == is_active)
        
        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: JobAlertCreate, user_id: int) -> JobAlert:
        db_obj = JobAlert(
            user_id=user_id,
            name=obj_in.name,
            keywords=obj_in.keywords,
            location=obj_in.location,
            job_type=obj_in.job_type,
            experience_level=obj_in.experience_level,
            salary_min=obj_in.salary_min,
            salary_max=obj_in.salary_max,
            is_remote=obj_in.is_remote,
            frequency=obj_in.frequency,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: JobAlert, obj_in: JobAlertUpdate) -> JobAlert:
        update_data = obj_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: int) -> JobAlert:
        obj = db.query(JobAlert).get(id)
        db.delete(obj)
        db.commit()
        return obj


job_alert = CRUDJobAlert()
