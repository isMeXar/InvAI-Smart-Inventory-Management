from django.core.management.base import BaseCommand
from notifications.services import NotificationService

class Command(BaseCommand):
    help = 'Clean up expired and old read notifications'

    def add_arguments(self, parser):
        parser.add_argument(
            '--expired-only',
            action='store_true',
            help='Only clean up expired notifications (default: False)',
        )
        parser.add_argument(
            '--days',
            type=int,
            default=30,
            help='Delete read notifications older than X days (default: 30)',
        )

    def handle(self, *args, **options):
        expired_only = options['expired_only']
        days = options['days']

        if expired_only:
            # Only clean up expired notifications
            deleted_count = NotificationService.cleanup_expired_notifications()
            self.stdout.write(
                self.style.SUCCESS(f'Deleted {deleted_count} expired notifications')
            )
        else:
            # Clean up both expired and old read notifications
            expired_count = NotificationService.cleanup_expired_notifications()
            old_read_count = NotificationService.cleanup_old_read_notifications(days)

            total_deleted = expired_count + old_read_count

            self.stdout.write(
                self.style.SUCCESS(
                    f'Cleaned up {total_deleted} notifications:\n'
                    f'  - {expired_count} expired notifications\n'
                    f'  - {old_read_count} old read notifications (older than {days} days)'
                )
            )