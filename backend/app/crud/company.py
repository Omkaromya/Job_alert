from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate


class CRUDCompany:
    def get(self, db: Session, id: int) -> Optional[Company]:
        return db.query(Company).filter(Company.id == id).first()

    def get_by_name(self, db: Session, name: str) -> Optional[Company]:
        return db.query(Company).filter(Company.name == name).first()

    def get_multi(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> List[Company]:
        query = db.query(Company)
        
        if is_active is not None:
            query = query.filter(Company.is_active == is_active)
        
        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: CompanyCreate) -> Company:
        db_obj = Company(
            name=obj_in.name,
            description=obj_in.description,
            website=obj_in.website,
            location=obj_in.location,
            industry=obj_in.industry,
            size=obj_in.size,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: Company, obj_in: CompanyUpdate) -> Company:
        update_data = obj_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: int) -> Company:
        obj = db.query(Company).get(id)
        db.delete(obj)
        db.commit()
        return obj


company = CRUDCompany()
