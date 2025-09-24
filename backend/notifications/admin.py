from django.contrib import admin
from .models import Notification, NotificationPreference

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'recipient', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'recipient__username', 'recipient__email']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    fieldsets = (
        (None, {
            'fields': ('recipient', 'title', 'message', 'notification_type', 'is_read')
        }),
        ('Optional Fields', {
            'fields': ('related_object_id', 'related_object_type', 'action_url', 'action_text', 'expires_at'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'email_enabled', 'push_enabled', 'auto_delete_read_after_days']
    list_filter = ['email_enabled', 'push_enabled']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        (None, {
            'fields': ('user',)
        }),
        ('Email Notifications', {
            'fields': ('email_enabled', 'email_inventory_low', 'email_order_status', 'email_user_action', 'email_system')
        }),
        ('Push Notifications', {
            'fields': ('push_enabled', 'push_inventory_low', 'push_order_status', 'push_user_action', 'push_system')
        }),
        ('Cleanup Settings', {
            'fields': ('auto_delete_read_after_days',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
