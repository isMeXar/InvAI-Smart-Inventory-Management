# 🔔 Notification System

## Overview
InvAI includes a real-time notification system that alerts users about important inventory events, order updates, and system activities.

## Notification Types

### 📦 Inventory Alerts
- **Low Stock**: Products running low on inventory
- **Out of Stock**: Products completely depleted
- **Restock Needed**: Automated reorder suggestions

### 📋 Order Updates
- **New Order**: Order placed successfully
- **Order Status Change**: Pending → Processing → Delivered
- **High-Value Order**: Orders exceeding threshold amount
- **Order Cancelled**: Order cancellation notifications

### 👥 User Actions
- **User Activity**: New user registrations, role changes
- **Permission Changes**: Access level modifications

### ⚙️ System Notifications
- **System Updates**: Important system messages
- **Error Alerts**: Critical system errors
- **Success Messages**: Successful operations

## Features

### Real-Time Updates
- Automatic polling every 5 seconds
- Unread count badge on notification bell
- Instant notifications for new events

### Notification Management
- **Mark as Read/Unread**: Individual or bulk actions
- **Delete**: Remove notifications individually or all read ones
- **Filter**: View by type, status, or date
- **Search**: Find specific notifications

### Detailed View
Click any notification to see:
- Full event description
- Related entity (Order ID, Product name, etc.)
- Timestamp (relative and exact)
- Action buttons (if applicable)

## User Preferences

Configure notification settings:
- Enable/disable specific notification types
- Email notifications (if configured)
- In-app notification preferences

Access via: **Profile → Notification Settings**

## API Endpoints

```
GET    /api/notifications/              # List all notifications
GET    /api/notifications/unread_count/ # Get unread count
POST   /api/notifications/{id}/mark_read/ # Mark as read
POST   /api/notifications/mark_all_read/  # Mark all as read
DELETE /api/notifications/{id}/         # Delete notification
```

## Sample Data

Generate test notifications:
```bash
python manage.py create_sample_notifications --count 15
```

This creates various notification types for testing the system.

## Technical Details

- **Backend**: Django REST Framework with PostgreSQL
- **Frontend**: React with real-time polling
- **Authentication**: JWT-based, user-specific notifications
- **Responsive**: Works on all screen sizes

## Usage

1. **View Notifications**: Click the bell icon in the navbar
2. **Read Details**: Click any notification for full information
3. **Manage**: Use bulk actions to mark as read or delete
4. **Configure**: Set preferences in your profile settings

---

**Note**: Notifications are user-specific and require authentication to view.
