import React, { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationItem from './NotificationItem';
import NotificationDetailModal from './NotificationDetailModal';
import { type Notification } from '../../services/notificationService';

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const displayedNotifications = notifications.slice(0, 8); // Show latest 8

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && notifications.length === 0) {
      fetchNotifications(true);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
    setIsOpen(false); // Close popover
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 sm:w-96 p-0 shadow-xl border-0 max-w-[calc(100vw-2rem)]"
        align="end"
        sideOffset={8}
      >
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-7"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-96">
          <div className="p-2">
            {isLoading && notifications.length === 0 ? (
              <div className="flex items-center justify-center h-20">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-20 text-center">
                <Bell className="h-6 w-6 text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {displayedNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    compact={true}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {notifications.length > 8 && (
          <div className="p-3 border-t bg-muted/30">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-sm"
              onClick={() => {
                window.location.href = '/dashboard/notifications';
                setIsOpen(false);
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>

      {/* Detail Modal - Rendered outside popover */}
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
        />
      )}
    </Popover>
  );
}