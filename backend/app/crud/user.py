from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


from sqlalchemy.orm import Session
from typing import Optional
from app.models.profile import Profile
from app.schemas.user import ProfileCreate
import json


class CRUDUser:
    def get(self, db: Session, id: int) -> Optional[User]:
        return db.query(User).filter(User.id == id).first()

    def get_profile(self, db: Session, user_id: int) -> Optional[Profile]:
        return db.query(Profile).filter(Profile.user_id == user_id).first()

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def get_by_username(self, db: Session, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()

    def get_by_mobile(self, db: Session, mobile_number: str) -> Optional[User]:
        return db.query(User).filter(User.mobile_number == mobile_number).first()

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100):
        return db.query(User).offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: UserCreate) -> User:
        # Handle full_name
        full_name = getattr(obj_in, "full_name", None)
        if full_name:
            names = full_name.split(' ', 1)
            first_name = names[0]
            last_name = names[1] if len(names) > 1 else None
        else:
            first_name = None
            last_name = None

        db_obj = User(
            email=obj_in.email,
            username=obj_in.username,
            password_hash=get_password_hash(obj_in.password),
            first_name=first_name,
            last_name=last_name,
            mobile_number=obj_in.mobile_number,
            role=obj_in.role,
            # Ensure consistent initial state regardless of DB defaults
            is_active=False,
            is_superuser=False,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: User, obj_in: UserUpdate) -> User:
        update_data = obj_in.model_dump(exclude_unset=True)
        if "password" in update_data:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def delete(self, db: Session, id: int) -> User:
        obj = db.query(User).get(id)
        db.delete(obj)
        db.commit()
        return obj

    def authenticate(self, db: Session, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    def authenticate_by_mobile(self, db: Session, mobile_number: str, otp: str) -> Optional[User]:
        user = self.get_by_mobile(db, mobile_number=mobile_number)
        if not user:
            return None
        if user.mobile_otp != otp:
            return None
        # Optionally check OTP expiration here
        return user

    def is_active(self, user: User) -> bool:
        return user.is_active

    def is_superuser(self, user: User) -> bool:
        return user.is_superuser

    def save_profile(self, db: Session, user_id: int, profile_in: ProfileCreate) -> Profile:
        # Check if profile already exists for this user
        existing_profile = db.query(Profile).filter(Profile.user_id == user_id).first()

        if existing_profile:
            # Update existing profile
            update_data = profile_in.model_dump()
            # Handle location field separately if needed
            location = update_data.pop("location", None)
            if location:
                # Example: store location as city if city is empty
                if not getattr(existing_profile, "city", None):
                    existing_profile.city = location
            for field, value in update_data.items():
                setattr(existing_profile, field, value)
            db.commit()
            db.refresh(existing_profile)
            return existing_profile
        else:
            # Create new profile
            profile_data = profile_in.model_dump()
            location = profile_data.pop("location", None)
            if location:
                profile_data["city"] = location  # Store location as city for new profile
            profile_data["user_id"] = user_id
            # Ensure default values for new fields
            profile_data.setdefault("is_active", True)
            db_profile = Profile(**profile_data)
            db.add(db_profile)
            db.commit()
            db.refresh(db_profile)
            return db_profile

    def update_profile_status(self, db: Session, user_id: int, is_active: bool = None) -> Profile:
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        if not profile:
            return None
        if is_active is not None:
            profile.is_active = is_active
        db.commit()
        db.refresh(profile)
        return profile


user = CRUDUser()
