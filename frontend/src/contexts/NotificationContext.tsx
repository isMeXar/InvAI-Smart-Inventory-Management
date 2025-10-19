import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import NotificationService, { type Notification, type NotificationPreference } from '../services/notificationService';
import { toast } from 'sonner';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreference | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

type NotificationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'SET_PREFERENCES'; payload: NotificationPreference }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'UPDATE_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: number }
  | { type: 'MARK_AS_READ'; payload: number }
  | { type: 'MARK_AS_UNREAD'; payload: number }
  | { type: 'MARK_ALL_READ' }
  | { type: 'SET_LAST_FETCHED'; payload: Date };

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  preferences: null,
  isLoading: false,
  error: null,
  lastFetched: null,
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.is_read).length,
        isLoading: false,
        error: null,
      };

    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };

    case 'SET_PREFERENCES':
      return { ...state, preferences: action.payload };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: action.payload.is_read ? state.unreadCount : state.unreadCount + 1,
      };

    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload.id ? action.payload : n
        ),
      };

    case 'REMOVE_NOTIFICATION': {
      const removedNotification = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: removedNotification && !removedNotification.is_read
          ? state.unreadCount - 1
          : state.unreadCount,
      };
    }

    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };

    case 'MARK_AS_UNREAD':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, is_read: false } : n
        ),
        unreadCount: state.unreadCount + 1,
      };

    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0,
      };

    case 'SET_LAST_FETCHED':
      return { ...state, lastFetched: action.payload };

    default:
      return state;
  }
}

interface NotificationContextType extends NotificationState {
  // Data fetching
  fetchNotifications: (force?: boolean) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  fetchPreferences: () => Promise<void>;

  // Notification actions
  markAsRead: (notificationId: number) => Promise<void>;
  markAsUnread: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  deleteAllRead: () => Promise<void>;

  // Bulk actions
  bulkMarkAsRead: (notificationIds: number[]) => Promise<void>;
  bulkMarkAsUnread: (notificationIds: number[]) => Promise<void>;
  bulkDelete: (notificationIds: number[]) => Promise<void>;

  // Preferences
  updatePreferences: (preferences: Partial<NotificationPreference>) => Promise<void>;

  // Utility
  clearError: () => void;
  refreshData: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const fetchNotifications = useCallback(async (force = false) => {
    // If we have recent data and it's not forced, skip the fetch
    if (!force && state.lastFetched && Date.now() - state.lastFetched.getTime() < 5000) {
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const notifications = await NotificationService.getNotifications();
      console.log('✅ Fetched notifications:', notifications.length);
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      dispatch({ type: 'SET_LAST_FETCHED', payload: new Date() });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch notifications' });
      console.error('❌ Error fetching notifications:', error);
    }
  }, [state.lastFetched]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await NotificationService.getUnreadCount();
      console.log('✅ Fetched unread count:', count);
      dispatch({ type: 'SET_UNREAD_COUNT', payload: count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  const fetchPreferences = useCallback(async () => {
    try {
      const preferences = await NotificationService.getPreferences();
      dispatch({ type: 'SET_PREFERENCES', payload: preferences });
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await NotificationService.markAsRead(notificationId);
      dispatch({ type: 'MARK_AS_READ', payload: notificationId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark notification as read' });
      console.error('Error marking as read:', error);
    }
  }, []);

  const markAsUnread = useCallback(async (notificationId: number) => {
    try {
      await NotificationService.markAsUnread(notificationId);
      dispatch({ type: 'MARK_AS_UNREAD', payload: notificationId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark notification as unread' });
      console.error('Error marking as unread:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const result = await NotificationService.markAllAsRead();
      dispatch({ type: 'MARK_ALL_READ' });
      toast.success(result.message);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark all notifications as read' });
      console.error('Error marking all as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
      toast.success('Notification deleted');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete notification' });
      console.error('Error deleting notification:', error);
    }
  }, []);

  const deleteAllRead = useCallback(async () => {
    try {
      const result = await NotificationService.deleteAllRead();
      // Refresh notifications to reflect the deletion
      await fetchNotifications(true);
      toast.success(result.message);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete read notifications' });
      console.error('Error deleting read notifications:', error);
    }
  }, [fetchNotifications]);

  const bulkMarkAsRead = useCallback(async (notificationIds: number[]) => {
    try {
      const result = await NotificationService.bulkAction({
        notification_ids: notificationIds,
        action: 'mark_read',
      });
      // Mark each notification as read in state
      notificationIds.forEach(id => dispatch({ type: 'MARK_AS_READ', payload: id }));
      toast.success(result.message);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark notifications as read' });
      console.error('Error bulk marking as read:', error);
    }
  }, []);

  const bulkMarkAsUnread = useCallback(async (notificationIds: number[]) => {
    try {
      const result = await NotificationService.bulkAction({
        notification_ids: notificationIds,
        action: 'mark_unread',
      });
      // Mark each notification as unread in state
      notificationIds.forEach(id => dispatch({ type: 'MARK_AS_UNREAD', payload: id }));
      toast.success(result.message);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark notifications as unread' });
      console.error('Error bulk marking as unread:', error);
    }
  }, []);

  const bulkDelete = useCallback(async (notificationIds: number[]) => {
    try {
      const result = await NotificationService.bulkAction({
        notification_ids: notificationIds,
        action: 'delete',
      });
      // Remove each notification from state
      notificationIds.forEach(id => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }));
      toast.success(result.message);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete notifications' });
      console.error('Error bulk deleting:', error);
    }
  }, []);

  const updatePreferences = useCallback(async (preferences: Partial<NotificationPreference>) => {
    try {
      const updated = await NotificationService.updatePreferences(preferences);
      dispatch({ type: 'SET_PREFERENCES', payload: updated });
      toast.success('Preferences updated');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update preferences' });
      console.error('Error updating preferences:', error);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchNotifications(true),
      fetchUnreadCount(),
      fetchPreferences(),
    ]);
  }, [fetchNotifications, fetchUnreadCount, fetchPreferences]);

  // Auto-fetch notifications on mount and set up polling
  useEffect(() => {
    console.log('🔔 Notification system initialized');
    fetchNotifications();
    fetchPreferences();

    // Set up aggressive polling for real-time updates (every 5 seconds)
    const interval = setInterval(() => {
      console.log('🔄 Polling for new notifications...');
      fetchNotifications(true);
      fetchUnreadCount();
    }, 5000);

    return () => {
      console.log('🔕 Notification system cleanup');
      clearInterval(interval);
    };
  }, [fetchNotifications, fetchUnreadCount, fetchPreferences]);

  const contextValue: NotificationContextType = {
    ...state,
    fetchNotifications,
    fetchUnreadCount,
    fetchPreferences,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    bulkMarkAsRead,
    bulkMarkAsUnread,
    bulkDelete,
    updatePreferences,
    clearError,
    refreshData,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}