from rest_framework import serializers
from .models import Notification, NotificationPreference, NotificationType

class NotificationSerializer(serializers.ModelSerializer):
    is_expired = serializers.ReadOnlyField()

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'is_read',
            'created_at', 'updated_at', 'related_object_id', 'related_object_type',
            'action_url', 'action_text', 'expires_at', 'is_expired'
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_expired']

class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'recipient', 'title', 'message', 'notification_type',
            'related_object_id', 'related_object_type', 'action_url',
            'action_text', 'expires_at'
        ]

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            'email_enabled', 'email_inventory_low', 'email_order_status',
            'email_user_action', 'email_system', 'push_enabled',
            'push_inventory_low', 'push_order_status', 'push_user_action',
            'push_system', 'auto_delete_read_after_days'
        ]

class NotificationBulkActionSerializer(serializers.Serializer):
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
    action = serializers.ChoiceField(choices=['mark_read', 'mark_unread', 'delete'])

class NotificationStatsSerializer(serializers.Serializer):
    total_count = serializers.IntegerField()
    unread_count = serializers.IntegerField()
    read_count = serializers.IntegerField()
    by_type = serializers.DictField(child=serializers.IntegerField())