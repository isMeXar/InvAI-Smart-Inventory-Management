import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Calendar, 
  User, 
  Package, 
  ShoppingCart, 
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink,
  Clock
} from 'lucide-react';
import { type Notification } from '../../services/notificationService';
import { cn } from '../../lib/utils';

interface NotificationDetailModalProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NotificationDetailModal({
  notification,
  open,
  onOpenChange,
}: NotificationDetailModalProps) {
  if (!notification) return null;

  const getTypeIcon = () => {
    const iconMap: Record<string, React.ReactNode> = {
      success: <CheckCircle className="h-6 w-6 text-green-500" />,
      warning: <AlertCircle className="h-6 w-6 text-yellow-500" />,
      error: <AlertCircle className="h-6 w-6 text-red-500" />,
      inventory_low: <Package className="h-6 w-6 text-orange-500" />,
      order_status: <ShoppingCart className="h-6 w-6 text-blue-500" />,
      order_high_value: <ShoppingCart className="h-6 w-6 text-emerald-500" />,
      user_action: <User className="h-6 w-6 text-purple-500" />,
      system: <Info className="h-6 w-6 text-gray-500" />,
      info: <Info className="h-6 w-6 text-blue-500" />,
    };
    return iconMap[notification.notification_type] || iconMap.info;
  };

  const getTypeBadge = () => {
    const badgeMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      success: { variant: 'default', label: 'Success' },
      warning: { variant: 'secondary', label: 'Warning' },
      error: { variant: 'destructive', label: 'Error' },
      inventory_low: { variant: 'secondary', label: 'Low Stock' },
      order_status: { variant: 'default', label: 'Order Update' },
      order_high_value: { variant: 'default', label: 'High Value' },
      user_action: { variant: 'secondary', label: 'User Action' },
      system: { variant: 'outline', label: 'System' },
      info: { variant: 'default', label: 'Information' },
    };
    const config = badgeMap[notification.notification_type] || badgeMap.info;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
    }).format(date);
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getEntityInfo = () => {
    if (!notification.related_object_type || !notification.related_object_id) {
      return null;
    }

    const typeLabels: Record<string, string> = {
      order: 'Order',
      product: 'Product',
      user: 'User',
      supplier: 'Supplier',
    };

    return {
      type: typeLabels[notification.related_object_type] || notification.related_object_type,
      id: notification.related_object_id,
    };
  };

  const entityInfo = getEntityInfo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto pr-8 w-[95vw] sm:w-full">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {getTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <DialogTitle className="text-xl">{notification.title}</DialogTitle>
                {getTypeBadge()}
              </div>
              <DialogDescription className="text-sm text-muted-foreground">
                {getRelativeTime(notification.created_at)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        {/* Event Description */}
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              What Happened
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-4 rounded-lg">
              {notification.message}
            </p>
          </div>

          {/* Entity Information */}
          {entityInfo && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                {notification.related_object_type === 'order' ? (
                  <ShoppingCart className="h-4 w-4" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
                Related {entityInfo.type}
              </h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{entityInfo.type} ID</p>
                    <p className="text-lg font-mono text-primary">#{entityInfo.id}</p>
                  </div>
                  {notification.action_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (notification.action_url) {
                          window.location.href = notification.action_url;
                        }
                      }}
                    >
                      View Details
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timestamp Details */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              When It Happened
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Relative:</span>
                <span className="font-medium">{getRelativeTime(notification.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Exact Time:</span>
                <span className="font-medium">{formatDate(notification.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Additional Metadata */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Additional Information
            </h3>
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Notification ID</p>
                  <p className="font-mono">{notification.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className={cn(
                    "font-medium",
                    notification.is_read ? "text-muted-foreground" : "text-primary"
                  )}>
                    {notification.is_read ? 'Read' : 'Unread'}
                  </p>
                </div>
                {notification.expires_at && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Expires</p>
                    <p className="font-medium">
                      {notification.is_expired ? (
                        <span className="text-red-500">Expired</span>
                      ) : (
                        formatDate(notification.expires_at)
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {notification.action_url && notification.action_text && (
          <>
            <Separator className="my-4" />
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  if (notification.action_url) {
                    window.location.href = notification.action_url;
                  }
                  onOpenChange(false);
                }}
                className="w-full sm:w-auto"
              >
                {notification.action_text}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
