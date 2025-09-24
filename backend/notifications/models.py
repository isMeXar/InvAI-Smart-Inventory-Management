from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class NotificationType(models.TextChoices):
    INFO = 'info', 'Information'
    SUCCESS = 'success', 'Success'
    WARNING = 'warning', 'Warning'
    ERROR = 'error', 'Error'
    INVENTORY_LOW = 'inventory_low', 'Low Inventory'
    ORDER_STATUS = 'order_status', 'Order Status'
    USER_ACTION = 'user_action', 'User Action'
    SYSTEM = 'system', 'System'

class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.INFO
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Optional fields for linking to specific objects
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object_type = models.CharField(max_length=50, null=True, blank=True)

    # Optional action button
    action_url = models.URLField(null=True, blank=True)
    action_text = models.CharField(max_length=100, null=True, blank=True)

    # Expiration date for temporary notifications
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"{self.title} - {self.recipient.username}"

    @property
    def is_expired(self):
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False

    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.save(update_fields=['is_read', 'updated_at'])

    def mark_as_unread(self):
        if self.is_read:
            self.is_read = False
            self.save(update_fields=['is_read', 'updated_at'])

class NotificationPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')

    # Email notification preferences
    email_enabled = models.BooleanField(default=True)
    email_inventory_low = models.BooleanField(default=True)
    email_order_status = models.BooleanField(default=True)
    email_user_action = models.BooleanField(default=False)
    email_system = models.BooleanField(default=True)

    # In-app notification preferences
    push_enabled = models.BooleanField(default=True)
    push_inventory_low = models.BooleanField(default=True)
    push_order_status = models.BooleanField(default=True)
    push_user_action = models.BooleanField(default=True)
    push_system = models.BooleanField(default=True)

    # Auto-delete read notifications after X days
    auto_delete_read_after_days = models.PositiveIntegerField(default=30)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - Notification Preferences"
