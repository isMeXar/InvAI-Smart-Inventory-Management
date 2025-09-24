from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from notifications.services import NotificationService, NotificationTemplates
from notifications.models import NotificationType
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample notifications for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=20,
            help='Number of notifications to create (default: 20)'
        )
        parser.add_argument(
            '--user-id',
            type=int,
            help='Specific user ID to create notifications for'
        )

    def handle(self, *args, **options):
        count = options['count']
        user_id = options.get('user_id')

        # Get users
        if user_id:
            try:
                users = [User.objects.get(id=user_id)]
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'User with ID {user_id} does not exist')
                )
                return
        else:
            users = list(User.objects.all())
            if not users:
                self.stdout.write(
                    self.style.ERROR('No users found. Create a user first.')
                )
                return

        # Sample notification data
        sample_notifications = [
            {
                'title': 'Welcome to InvAI!',
                'message': 'Welcome to your new inventory management system. Get started by exploring the dashboard.',
                'notification_type': NotificationType.SUCCESS,
                'action_url': '/dashboard',
                'action_text': 'Go to Dashboard'
            },
            {
                'title': 'Low Stock Alert',
                'message': 'Product "Widget A" is running low. Current stock: 5, minimum required: 20.',
                'notification_type': NotificationType.INVENTORY_LOW,
                'action_url': '/dashboard/products',
                'action_text': 'View Products'
            },
            {
                'title': 'Order Status Update',
                'message': 'Order #12345 has been shipped and is on its way.',
                'notification_type': NotificationType.ORDER_STATUS,
                'action_url': '/dashboard/orders',
                'action_text': 'View Order'
            },
            {
                'title': 'System Maintenance Scheduled',
                'message': 'Scheduled maintenance on Sunday 2AM-4AM. Service may be temporarily unavailable.',
                'notification_type': NotificationType.WARNING,
                'expires_at': timezone.now() + timezone.timedelta(days=7)
            },
            {
                'title': 'New Supplier Added',
                'message': 'Supplier "Tech Solutions Inc." has been successfully added to your system.',
                'notification_type': NotificationType.SUCCESS,
                'action_url': '/dashboard/suppliers',
                'action_text': 'View Suppliers'
            },
            {
                'title': 'Data Export Complete',
                'message': 'Your inventory data export has been completed and is ready for download.',
                'notification_type': NotificationType.INFO,
                'action_url': '/dashboard/settings',
                'action_text': 'Download'
            },
            {
                'title': 'Profile Updated',
                'message': 'Your profile information has been successfully updated.',
                'notification_type': NotificationType.USER_ACTION,
            },
            {
                'title': 'Security Alert',
                'message': 'New login detected from a different device. If this wasn\'t you, please secure your account.',
                'notification_type': NotificationType.ERROR,
                'action_url': '/dashboard/settings',
                'action_text': 'Check Security'
            },
            {
                'title': 'Inventory Report Generated',
                'message': 'Your monthly inventory report has been generated and is available for review.',
                'notification_type': NotificationType.INFO,
                'action_url': '/dashboard/reports',
                'action_text': 'View Report'
            },
            {
                'title': 'Critical Stock Level',
                'message': 'Multiple products are below critical stock levels. Immediate attention required.',
                'notification_type': NotificationType.ERROR,
                'action_url': '/dashboard/products',
                'action_text': 'View Critical Items'
            },
            {
                'title': 'New Feature Available',
                'message': 'AI-powered demand forecasting is now available in your dashboard!',
                'notification_type': NotificationType.SUCCESS,
                'action_url': '/dashboard/forecasts',
                'action_text': 'Try It Now'
            },
            {
                'title': 'Backup Completed',
                'message': 'Your daily data backup has been completed successfully.',
                'notification_type': NotificationType.SYSTEM,
            },
            {
                'title': 'Price Update Alert',
                'message': 'Supplier "Global Parts Co." has updated pricing for 15 products.',
                'notification_type': NotificationType.WARNING,
                'action_url': '/dashboard/suppliers',
                'action_text': 'Review Changes'
            },
            {
                'title': 'Order Delivery Delayed',
                'message': 'Order #67890 delivery has been delayed by 2 days due to weather conditions.',
                'notification_type': NotificationType.WARNING,
                'action_url': '/dashboard/orders',
                'action_text': 'Track Order'
            },
            {
                'title': 'User Permission Updated',
                'message': 'Your account permissions have been updated by an administrator.',
                'notification_type': NotificationType.USER_ACTION,
            }
        ]

        created_count = 0

        for i in range(count):
            # Select random user and notification data
            user = random.choice(users)
            notification_data = random.choice(sample_notifications)

            # Create notification
            NotificationService.create_notification(
                recipient=user,
                **notification_data
            )
            created_count += 1

            # Randomly mark some as read (30% chance)
            if random.random() < 0.3:
                # Find the notification we just created and mark it as read
                latest_notification = user.notifications.first()
                if latest_notification:
                    latest_notification.mark_as_read()

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_count} sample notifications'
            )
        )

        # Display summary
        total_notifications = sum(user.notifications.count() for user in users)
        unread_notifications = sum(user.notifications.filter(is_read=False).count() for user in users)

        self.stdout.write(f'Total notifications in system: {total_notifications}')
        self.stdout.write(f'Unread notifications: {unread_notifications}')

        # Show notifications per user
        for user in users:
            user_total = user.notifications.count()
            user_unread = user.notifications.filter(is_read=False).count()
            self.stdout.write(f'{user.username}: {user_total} total, {user_unread} unread')