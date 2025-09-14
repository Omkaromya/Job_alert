from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.api import deps
from app.crud.notification import notification as notification_crud
from app.schemas.notification import NotificationResponse, NotificationList
from app.models.user import User
from app.database import get_db

router = APIRouter()

@router.get("/", response_model=NotificationList)
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    is_read: Optional[bool] = Query(None),
):
    notifications = notification_crud.get_by_user(db, user_id=current_user.id, skip=skip, limit=limit, is_read=is_read)
    unread_count = notification_crud.get_unread_count(db, user_id=current_user.id)
    return NotificationList(
        notifications=notifications,
        total=len(notifications),
        unread_count=unread_count
    )

@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    notification_obj = notification_crud.mark_as_read(db, notification_id=notification_id, user_id=current_user.id)
    if not notification_obj:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification_obj

@router.put("/read-all", response_model=int)
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    updated_count = notification_crud.mark_all_as_read(db, user_id=current_user.id)
    return updated_count
