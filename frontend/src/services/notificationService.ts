interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  related_object_id?: number;
  related_object_type?: string;
  action_url?: string;
  action_text?: string;
  expires_at?: string;
  is_expired: boolean;
}

interface NotificationPreference {
  email_enabled: boolean;
  email_inventory_low: boolean;
  email_order_status: boolean;
  email_order_high_value: boolean;
  email_user_action: boolean;
  email_system: boolean;
  push_enabled: boolean;
  push_inventory_low: boolean;
  push_order_status: boolean;
  push_order_high_value: boolean;
  push_user_action: boolean;
  push_system: boolean;
  auto_delete_read_after_days: number;
}

interface NotificationStats {
  total_count: number;
  unread_count: number;
  read_count: number;
  by_type: Record<string, number>;
}

interface BulkActionRequest {
  notification_ids: number[];
  action: 'mark_read' | 'mark_unread' | 'delete';
}

interface ApiResponse<T> {
  results?: T[];
  count?: number;
  next?: string;
  previous?: string;
}

const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/notifications`;

class NotificationService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        ...this.getAuthHeaders(),
        ...(options.headers || {}),
      },
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Get all notifications for current user
  async getNotifications(params?: {
    is_read?: boolean;
    type?: string;
    limit?: number;
  }): Promise<Notification[]> {
    const searchParams = new URLSearchParams();

    if (params?.is_read !== undefined) {
      searchParams.append('is_read', params.is_read.toString());
    }
    if (params?.type) {
      searchParams.append('type', params.type);
    }
    if (params?.limit) {
      searchParams.append('limit', params.limit.toString());
    }

    const queryString = searchParams.toString();
    const endpoint = `/${queryString ? `?${queryString}` : ''}`;

    return this.request<Notification[]>(endpoint);
  }

  // Get unread notifications count
  async getUnreadCount(): Promise<number> {
    const response = await this.request<{ unread_count: number }>('/unread_count/');
    return response.unread_count;
  }

  // Get notification statistics
  async getStats(): Promise<NotificationStats> {
    return this.request<NotificationStats>('/stats/');
  }

  // Create a new notification (admin only)
  async createNotification(notification: Partial<Notification>): Promise<Notification> {
    return this.request<Notification>('/', {
      method: 'POST',
      body: JSON.stringify(notification),
    });
  }

  // Mark a specific notification as read
  async markAsRead(notificationId: number): Promise<Notification> {
    return this.request<Notification>(`/${notificationId}/mark_read/`, {
      method: 'POST',
    });
  }

  // Mark a specific notification as unread
  async markAsUnread(notificationId: number): Promise<Notification> {
    return this.request<Notification>(`/${notificationId}/mark_unread/`, {
      method: 'POST',
    });
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ message: string; updated_count: number }> {
    return this.request<{ message: string; updated_count: number }>('/mark_all_read/', {
      method: 'POST',
    });
  }

  // Perform bulk actions on notifications
  async bulkAction(action: BulkActionRequest): Promise<{ message: string; affected_count: number }> {
    return this.request<{ message: string; affected_count: number }>('/bulk_action/', {
      method: 'POST',
      body: JSON.stringify(action),
    });
  }

  // Delete a specific notification
  async deleteNotification(notificationId: number): Promise<void> {
    await this.request(`/${notificationId}/`, {
      method: 'DELETE',
    });
  }

  // Delete all read notifications
  async deleteAllRead(): Promise<{ message: string; deleted_count: number }> {
    return this.request<{ message: string; deleted_count: number }>('/delete_all_read/', {
      method: 'DELETE',
    });
  }

  // Get notification preferences
  async getPreferences(): Promise<NotificationPreference> {
    // The API endpoint uses a detail view for current user's preferences
    return this.request<NotificationPreference>('/preferences/0/');
  }

  // Update notification preferences
  async updatePreferences(preferences: Partial<NotificationPreference>): Promise<NotificationPreference> {
    return this.request<NotificationPreference>('/preferences/0/', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }

  // Utility methods for notification types
  getNotificationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      inventory_low: '📦',
      order_status: '📋',
      order_high_value: '💰',
      user_action: '👤',
      system: '⚙️',
    };
    return iconMap[type] || 'ℹ️';
  }

  getNotificationColor(type: string): string {
    const colorMap: Record<string, string> = {
      info: 'blue',
      success: 'green',
      warning: 'yellow',
      error: 'red',
      inventory_low: 'orange',
      order_status: 'purple',
      order_high_value: 'emerald',
      user_action: 'indigo',
      system: 'gray',
    };
    return colorMap[type] || 'blue';
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }

    // For older dates, show the actual date
    return date.toLocaleDateString();
  }
}

export default new NotificationService();

// Export types for use in components
export type {
  Notification,
  NotificationPreference,
  NotificationStats,
  BulkActionRequest,
};