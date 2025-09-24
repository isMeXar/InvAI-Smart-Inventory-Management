from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone

from .models import Notification, NotificationPreference
from .serializers import (
    NotificationSerializer,
    NotificationCreateSerializer,
    NotificationPreferenceSerializer,
    NotificationBulkActionSerializer,
    NotificationStatsSerializer
)
from .services import NotificationService

class NotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        """Get notifications for the current user, excluding expired ones"""
        return Notification.objects.filter(
            recipient=self.request.user
        ).filter(
            Q(expires_at__isnull=True) | Q(expires_at__gt=timezone.now())
        ).select_related('recipient')

    def get_serializer_class(self):
        if self.action == 'create':
            return NotificationCreateSerializer
        return NotificationSerializer

    def create(self, request, *args, **kwargs):
        """Create a new notification"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Ensure the recipient is set to current user for non-admin users
        if not request.user.is_staff:
            serializer.validated_data['recipient'] = request.user

        notification = serializer.save()
        return_serializer = NotificationSerializer(notification)
        return Response(return_serializer.data, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        """List notifications with optional filtering"""
        queryset = self.get_queryset()

        # Filter by read status
        is_read = request.query_params.get('is_read')
        if is_read is not None:
            is_read_bool = is_read.lower() == 'true'
            queryset = queryset.filter(is_read=is_read_bool)

        # Filter by type
        notification_type = request.query_params.get('type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)

        # Limit results
        limit = request.query_params.get('limit')
        if limit:
            try:
                limit_int = int(limit)
                queryset = queryset[:limit_int]
            except ValueError:
                pass

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a specific notification as read"""
        notification = self.get_object()
        notification.mark_as_read()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_unread(self, request, pk=None):
        """Mark a specific notification as unread"""
        notification = self.get_object()
        notification.mark_as_unread()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read for the current user"""
        updated_count = NotificationService.mark_all_as_read(request.user)
        return Response({
            'message': f'Marked {updated_count} notifications as read',
            'updated_count': updated_count
        })

    @action(detail=False, methods=['post'])
    def bulk_action(self, request):
        """Perform bulk actions on multiple notifications"""
        serializer = NotificationBulkActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        notification_ids = serializer.validated_data['notification_ids']
        action_type = serializer.validated_data['action']

        if action_type == 'mark_read':
            updated_count = NotificationService.mark_notifications_as_read(
                notification_ids, request.user
            )
            message = f'Marked {updated_count} notifications as read'
        elif action_type == 'mark_unread':
            updated_count = NotificationService.mark_notifications_as_unread(
                notification_ids, request.user
            )
            message = f'Marked {updated_count} notifications as unread'
        elif action_type == 'delete':
            deleted_count = NotificationService.delete_notifications(
                notification_ids, request.user
            )
            message = f'Deleted {deleted_count} notifications'
            updated_count = deleted_count
        else:
            return Response(
                {'error': 'Invalid action'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            'message': message,
            'affected_count': updated_count
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get notification statistics for the current user"""
        stats_data = NotificationService.get_notification_stats(request.user)
        serializer = NotificationStatsSerializer(stats_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        unread_count = self.get_queryset().filter(is_read=False).count()
        return Response({'unread_count': unread_count})

    @action(detail=False, methods=['delete'])
    def delete_all_read(self, request):
        """Delete all read notifications for the current user"""
        deleted_count = NotificationService.delete_all_read_notifications(request.user)
        return Response({
            'message': f'Deleted {deleted_count} read notifications',
            'deleted_count': deleted_count
        })

class NotificationPreferenceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationPreferenceSerializer
    http_method_names = ['get', 'put', 'patch']

    def get_object(self):
        """Get or create notification preferences for the current user"""
        return NotificationService.get_or_create_user_preferences(self.request.user)

    def get_queryset(self):
        """Not used since we always work with current user's preferences"""
        return NotificationPreference.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        """Get current user's notification preferences"""
        preferences = self.get_object()
        serializer = self.get_serializer(preferences)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        """Update current user's notification preferences"""
        preferences = self.get_object()
        serializer = self.get_serializer(preferences, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        """Partially update current user's notification preferences"""
        return self.update(request, *args, **kwargs)
