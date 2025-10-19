from typing import List, Optional, Dict, Any
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Q, Count
from .models import Notification, NotificationPreference, NotificationType

User = get_user_model()

class NotificationService:
    """
    Service class for managing notifications
    """

    @staticmethod
    def create_notification(
        recipient: User,
        title: str,
        message: str,
        notification_type: str = NotificationType.INFO,
        related_object_id: Optional[int] = None,
        related_object_type: Optional[str] = None,
        action_url: Optional[str] = None,
        action_text: Optional[str] = None,
        expires_at: Optional[timezone.datetime] = None
    ) -> Notification:
        """Create a new notification"""
        notification = Notification.objects.create(
            recipient=recipient,
            title=title,
            message=message,
            notification_type=notification_type,
            related_object_id=related_object_id,
            related_object_type=related_object_type,
            action_url=action_url,
            action_text=action_text,
            expires_at=expires_at
        )
        return notification

    @staticmethod
    def create_bulk_notifications(
        recipients: List[User],
        title: str,
        message: str,
        notification_type: str = NotificationType.INFO,
        **kwargs
    ) -> List[Notification]:
        """Create notifications for multiple recipients"""
        notifications = []
        for recipient in recipients:
            notification = NotificationService.create_notification(
                recipient=recipient,
                title=title,
                message=message,
                notification_type=notification_type,
                **kwargs
            )
            notifications.append(notification)
        return notifications

    @staticmethod
    def get_user_notifications(
        user: User,
        is_read: Optional[bool] = None,
        notification_type: Optional[str] = None,
        limit: Optional[int] = None
    ) -> List[Notification]:
        """Get notifications for a specific user"""
        queryset = Notification.objects.filter(recipient=user)

        # Filter expired notifications
        queryset = queryset.filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
        )

        if is_read is not None:
            queryset = queryset.filter(is_read=is_read)

        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)

        if limit:
            queryset = queryset[:limit]

        return list(queryset)

    @staticmethod
    def mark_notifications_as_read(notification_ids: List[int], user: User) -> int:
        """Mark multiple notifications as read for a user"""
        updated = Notification.objects.filter(
            id__in=notification_ids,
            recipient=user,
            is_read=False
        ).update(is_read=True, updated_at=timezone.now())
        return updated

    @staticmethod
    def mark_notifications_as_unread(notification_ids: List[int], user: User) -> int:
        """Mark multiple notifications as unread for a user"""
        updated = Notification.objects.filter(
            id__in=notification_ids,
            recipient=user,
            is_read=True
        ).update(is_read=False, updated_at=timezone.now())
        return updated

    @staticmethod
    def mark_all_as_read(user: User) -> int:
        """Mark all notifications as read for a user"""
        updated = Notification.objects.filter(
            recipient=user,
            is_read=False
        ).update(is_read=True, updated_at=timezone.now())
        return updated

    @staticmethod
    def delete_notifications(notification_ids: List[int], user: User) -> int:
        """Delete multiple notifications for a user"""
        deleted, _ = Notification.objects.filter(
            id__in=notification_ids,
            recipient=user
        ).delete()
        return deleted

    @staticmethod
    def delete_all_read_notifications(user: User) -> int:
        """Delete all read notifications for a user"""
        deleted, _ = Notification.objects.filter(
            recipient=user,
            is_read=True
        ).delete()
        return deleted

    @staticmethod
    def get_notification_stats(user: User) -> Dict[str, Any]:
        """Get notification statistics for a user"""
        notifications = Notification.objects.filter(
            recipient=user
        ).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
        )

        total_count = notifications.count()
        unread_count = notifications.filter(is_read=False).count()
        read_count = total_count - unread_count

        # Count by type
        by_type = notifications.values('notification_type').annotate(
            count=Count('id')
        )
        type_counts = {item['notification_type']: item['count'] for item in by_type}

        return {
            'total_count': total_count,
            'unread_count': unread_count,
            'read_count': read_count,
            'by_type': type_counts
        }

    @staticmethod
    def cleanup_expired_notifications() -> int:
        """Remove expired notifications"""
        deleted, _ = Notification.objects.filter(
            expires_at__lt=timezone.now()
        ).delete()
        return deleted

    @staticmethod
    def cleanup_old_read_notifications(days: int = 30) -> int:
        """Remove old read notifications"""
        cutoff_date = timezone.now() - timezone.timedelta(days=days)
        deleted, _ = Notification.objects.filter(
            is_read=True,
            updated_at__lt=cutoff_date
        ).delete()
        return deleted

    @staticmethod
    def get_or_create_user_preferences(user: User) -> NotificationPreference:
        """Get or create notification preferences for a user"""
        preferences, created = NotificationPreference.objects.get_or_create(
            user=user,
            defaults={
                'email_enabled': True,
                'push_enabled': True,
            }
        )
        return preferences

    @staticmethod
    def should_send_notification(user: User, notification_type: str) -> bool:
        """Check if notification should be sent based on user preferences"""
        try:
            preferences = user.notification_preferences
        except NotificationPreference.DoesNotExist:
            preferences = NotificationService.get_or_create_user_preferences(user)

        if not preferences.push_enabled:
            return False

        type_mapping = {
            NotificationType.INVENTORY_LOW: preferences.push_inventory_low,
            NotificationType.ORDER_STATUS: preferences.push_order_status,
            NotificationType.ORDER_HIGH_VALUE: preferences.push_order_high_value,
            NotificationType.USER_ACTION: preferences.push_user_action,
            NotificationType.SYSTEM: preferences.push_system,
        }

        return type_mapping.get(notification_type, True)

# Convenience functions for common notification types
class NotificationTemplates:
    """Pre-defined notification templates"""

    @staticmethod
    def inventory_low_stock(user: User, product_name: str, current_stock: int, min_stock: int):
        return NotificationService.create_notification(
            recipient=user,
            title="Low Stock Alert",
            message=f"{product_name} is running low. Current stock: {current_stock}, minimum required: {min_stock}",
            notification_type=NotificationType.INVENTORY_LOW,
            action_url="/products",
            action_text="View Products"
        )

    @staticmethod
    def order_status_update(user: User, order_id: str, status: str):
        return NotificationService.create_notification(
            recipient=user,
            title="Order Status Updated",
            message=f"Order #{order_id} status has been updated to: {status}",
            notification_type=NotificationType.ORDER_STATUS,
            action_url=f"/orders/{order_id}",
            action_text="View Order"
        )

    @staticmethod
    def welcome_notification(user: User):
        return NotificationService.create_notification(
            recipient=user,
            title="Welcome to InvAI!",
            message="Welcome to your inventory management system. Explore the dashboard to get started.",
            notification_type=NotificationType.SUCCESS,
            action_url="/dashboard",
            action_text="Go to Dashboard"
        )

    @staticmethod
    def system_maintenance(users: List[User], start_time: timezone.datetime):
        return NotificationService.create_bulk_notifications(
            recipients=users,
            title="Scheduled Maintenance",
            message=f"System maintenance is scheduled for {start_time.strftime('%Y-%m-%d %H:%M')}. Service may be temporarily unavailable.",
            notification_type=NotificationType.WARNING,
            expires_at=start_time + timezone.timedelta(hours=2)
        )