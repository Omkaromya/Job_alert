from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate, NotificationUpdate


class CRUDNotification:
    def get(self, db: Session, id: int) -> Optional[Notification]:
        return db.query(Notification).filter(Notification.id == id).first()

    def get_by_user(
        self,
        db: Session,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        is_read: Optional[bool] = None
    ) -> List[Notification]:
        query = db.query(Notification).filter(Notification.user_id == user_id)
        if is_read is not None:
            query = query.filter(Notification.is_read == is_read)
        return query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()

    def get_unread_count(self, db: Session, user_id: int) -> int:
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()

    def create(self, db: Session, obj_in: NotificationCreate) -> Notification:
        db_obj = Notification(
            user_id=obj_in.user_id,
            title=obj_in.title,
            message=obj_in.message,
            notification_type=obj_in.notification_type,
            related_job_id=obj_in.related_job_id,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: Notification, obj_in: NotificationUpdate) -> Notification:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def mark_as_read(self, db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        if notification:
            notification.is_read = True
            db.commit()
            db.refresh(notification)
        return notification

    def mark_all_as_read(self, db: Session, user_id: int) -> int:
        updated_count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True})
        db.commit()
        return updated_count

    def delete(self, db: Session, id: int) -> Notification:
        obj = db.query(Notification).get(id)
        db.delete(obj)
        db.commit()
        return obj


notification = CRUDNotification()
