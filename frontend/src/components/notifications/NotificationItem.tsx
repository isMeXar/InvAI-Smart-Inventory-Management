import React from 'react';
import { Check, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationService, { type Notification } from '../../services/notificationService';

interface NotificationItemProps {
  notification: Notification;
  className?: string;
  compact?: boolean;
}

export default function NotificationItem({
  notification,
  className,
  compact = false,
}: NotificationItemProps) {
  const { markAsRead } = useNotifications();

  const handleClick = () => {
    // Mark as read when clicked
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate if there's an action URL
    if (notification.action_url) {
      if (notification.action_url.startsWith('/')) {
        window.location.href = notification.action_url;
      } else {
        window.open(notification.action_url, '_blank');
      }
    }
  };

  const getTypeColor = () => {
    const colors = {
      success: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      error: 'text-red-600 dark:text-red-400',
      inventory_low: 'text-orange-600 dark:text-orange-400',
      order_status: 'text-blue-600 dark:text-blue-400',
      user_action: 'text-purple-600 dark:text-purple-400',
      system: 'text-gray-600 dark:text-gray-400',
      info: 'text-blue-600 dark:text-blue-400',
    };
    return colors[notification.notification_type as keyof typeof colors] || colors.info;
  };

  const getTypeIcon = () => {
    const icons = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      inventory_low: '📦',
      order_status: '📋',
      user_action: '👤',
      system: '⚙️',
      info: 'ℹ️',
    };
    return icons[notification.notification_type as keyof typeof icons] || 'ℹ️';
  };

  const timeAgo = NotificationService.formatTimeAgo(notification.created_at);

  return (
    <div
      className={cn(
        'p-3 rounded-lg transition-all duration-200 cursor-pointer group',
        !notification.is_read
          ? 'bg-blue-50/50 dark:bg-blue-950/20 border-l-2 border-l-blue-500'
          : 'hover:bg-muted/50',
        compact && 'p-2',
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('text-sm mt-0.5', getTypeColor())}>
          {getTypeIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              'font-medium leading-tight',
              compact ? 'text-sm' : 'text-sm',
              !notification.is_read ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {notification.title}
            </h4>

            {!notification.is_read && (
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1" />
            )}
          </div>

          <p className={cn(
            'text-muted-foreground leading-relaxed',
            compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'
          )}>
            {notification.message}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {timeAgo}
            </span>

            {notification.action_url && notification.action_text && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                {notification.action_text}
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}