# InvAI Backend API Endpoints

Base URL: `http://localhost:8000`

## Authentication
- **POST** `/api/auth/login/` - User login
- **POST** `/api/auth/logout/` - User logout
- **GET** `/api/auth/users/` - List all users
- **POST** `/api/auth/users/` - Create new user
- **GET** `/api/auth/users/{id}/` - Get user details
- **PUT** `/api/auth/users/{id}/` - Update user
- **DELETE** `/api/auth/users/{id}/` - Delete user

## Inventory Management

### Products
- **GET** `/api/products/` - List all products
- **POST** `/api/products/` - Create new product
- **GET** `/api/products/{id}/` - Get product details
- **PUT** `/api/products/{id}/` - Update product
- **DELETE** `/api/products/{id}/` - Delete product
- **GET** `/api/products/low_stock/` - Get low stock products
- **GET** `/api/products/stats/` - Get product statistics

### Suppliers
- **GET** `/api/suppliers/` - List all suppliers
- **POST** `/api/suppliers/` - Create new supplier
- **GET** `/api/suppliers/{id}/` - Get supplier details
- **PUT** `/api/suppliers/{id}/` - Update supplier
- **DELETE** `/api/suppliers/{id}/` - Delete supplier

### Orders
- **GET** `/api/orders/` - List all orders
- **POST** `/api/orders/` - Create new order
- **GET** `/api/orders/{id}/` - Get order details
- **PUT** `/api/orders/{id}/` - Update order
- **DELETE** `/api/orders/{id}/` - Delete order
- **GET** `/api/orders/stats/` - Get order statistics

## AI Insights
- **POST** `/api/ai-insights/generate/` - Generate AI insights
- **GET** `/api/ai-insights/status/` - Check AI service status

## Notifications
- **GET** `/api/notifications/` - List all notifications (requires authentication)
- **GET** `/api/notifications/{id}/` - Get notification details
- **DELETE** `/api/notifications/{id}/` - Delete notification
- **POST** `/api/notifications/{id}/mark_read/` - Mark notification as read
- **POST** `/api/notifications/{id}/mark_unread/` - Mark notification as unread
- **POST** `/api/notifications/mark_all_read/` - Mark all notifications as read
- **POST** `/api/notifications/bulk_action/` - Perform bulk actions
- **DELETE** `/api/notifications/delete_all_read/` - Delete all read notifications
- **GET** `/api/notifications/unread_count/` - Get unread notification count
- **GET** `/api/notifications/stats/` - Get notification statistics

### Notification Preferences
- **GET** `/api/notifications/preferences/` - List notification preferences
- **POST** `/api/notifications/preferences/` - Create notification preference
- **GET** `/api/notifications/preferences/{id}/` - Get preference details
- **PUT** `/api/notifications/preferences/{id}/` - Update preference
- **DELETE** `/api/notifications/preferences/{id}/` - Delete preference

## Admin
- **GET** `/admin/` - Django admin panel

## Notes
- All endpoints support pagination (default: 20 items per page)
- Most endpoints require authentication except products, suppliers, and orders (currently set to AllowAny for testing)
- All POST/PUT requests should include `Content-Type: application/json` header
- CORS is enabled for `http://localhost:8080` and `http://127.0.0.1:8080`
