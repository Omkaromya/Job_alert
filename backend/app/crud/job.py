from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional, List
from app.models.job import Job
from app.schemas.job import JobCreate, JobUpdate


class CRUDJob:
    def get(self, db: Session, id: int) -> Optional[Job]:
        return db.query(Job).filter(Job.id == id).first()

    def get_multi(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        company_id: Optional[int] = None,
        is_active: Optional[bool] = None
    ) -> List[Job]:
        query = db.query(Job)
        
        if company_id is not None:
            query = query.filter(Job.company_id == company_id)
        
        if is_active is not None:
            query = query.filter(Job.is_active == is_active)
        
        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: JobCreate) -> Job:
        db_obj = Job(
            title=obj_in.title,
            description=obj_in.description,
            requirements=obj_in.requirements,
            salary_min=obj_in.salary_min,
            salary_max=obj_in.salary_max,
            location=obj_in.location,
            job_type=obj_in.job_type,
            experience_level=obj_in.experience_level,
            is_remote=obj_in.is_remote,
            company_id=obj_in.company_id,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: Job, obj_in: JobUpdate) -> Job:
        update_data = obj_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: int) -> Job:
        obj = db.query(Job).get(id)
        db.delete(obj)
        db.commit()
        return obj

    def search_jobs(
        self,
        db: Session,
        keywords: Optional[List[str]] = None,
        location: Optional[str] = None,
        job_type: Optional[str] = None,
        experience_level: Optional[str] = None,
        is_remote: Optional[bool] = None,
        salary_min: Optional[float] = None,
        salary_max: Optional[float] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Job]:
        query = db.query(Job).filter(Job.is_active == True)
        
        if keywords:
            keyword_filters = []
            for keyword in keywords:
                keyword_filters.append(
                    or_(
                        Job.title.ilike(f"%{keyword}%"),
                        Job.description.ilike(f"%{keyword}%"),
                        Job.requirements.ilike(f"%{keyword}%")
                    )
                )
            query = query.filter(or_(*keyword_filters))
        
        if location:
            query = query.filter(Job.location.ilike(f"%{location}%"))
        
        if job_type:
            query = query.filter(Job.job_type == job_type)
        
        if experience_level:
            query = query.filter(Job.experience_level == experience_level)
        
        if is_remote is not None:
            query = query.filter(Job.is_remote == is_remote)
        
        if salary_min is not None:
            query = query.filter(Job.salary_max >= salary_min)
        
        if salary_max is not None:
            query = query.filter(Job.salary_min <= salary_max)
        
        return query.offset(skip).limit(limit).all()


job = CRUDJob()
