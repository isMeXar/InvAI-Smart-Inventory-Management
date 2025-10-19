# 📡 API Endpoints

**Base URL**: `http://localhost:8000`

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | User login (returns JWT token) |
| POST | `/api/auth/logout/` | User logout |
| GET | `/api/auth/users/` | List all users |
| POST | `/api/auth/users/` | Create new user |
| GET | `/api/auth/users/{id}/` | Get user details |
| PUT | `/api/auth/users/{id}/` | Update user |
| DELETE | `/api/auth/users/{id}/` | Delete user |

## Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/` | List all products |
| POST | `/api/products/` | Create new product |
| GET | `/api/products/{id}/` | Get product details |
| PUT | `/api/products/{id}/` | Update product |
| DELETE | `/api/products/{id}/` | Delete product |
| GET | `/api/products/low_stock/` | Get low stock products |
| GET | `/api/products/stats/` | Get product statistics |

## Suppliers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/suppliers/` | List all suppliers |
| POST | `/api/suppliers/` | Create new supplier |
| GET | `/api/suppliers/{id}/` | Get supplier details |
| PUT | `/api/suppliers/{id}/` | Update supplier |
| DELETE | `/api/suppliers/{id}/` | Delete supplier |

## Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/` | List all orders |
| POST | `/api/orders/` | Create new order |
| GET | `/api/orders/{id}/` | Get order details |
| PUT | `/api/orders/{id}/` | Update order |
| DELETE | `/api/orders/{id}/` | Delete order |
| GET | `/api/orders/stats/` | Get order statistics |

## AI Insights

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai-insights/generate/` | Generate AI insights |
| GET | `/api/ai-insights/status/` | Check AI service status |

## Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/` | List all notifications |
| GET | `/api/notifications/{id}/` | Get notification details |
| POST | `/api/notifications/{id}/mark_read/` | Mark as read |
| POST | `/api/notifications/{id}/mark_unread/` | Mark as unread |
| POST | `/api/notifications/mark_all_read/` | Mark all as read |
| DELETE | `/api/notifications/{id}/` | Delete notification |
| DELETE | `/api/notifications/delete_all_read/` | Delete all read |
| GET | `/api/notifications/unread_count/` | Get unread count |
| GET | `/api/notifications/stats/` | Get statistics |
| POST | `/api/notifications/bulk_action/` | Bulk actions |

### Notification Preferences

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/preferences/` | List preferences |
| POST | `/api/notifications/preferences/` | Create preference |
| GET | `/api/notifications/preferences/{id}/` | Get preference |
| PUT | `/api/notifications/preferences/{id}/` | Update preference |
| DELETE | `/api/notifications/preferences/{id}/` | Delete preference |

## Admin Panel

- **GET** `/admin/` - Django admin interface

## Request/Response Format

### Authentication
```bash
# Login
POST /api/auth/login/
{
  "username": "admin",
  "password": "password"
}

# Response
{
  "access": "jwt_token_here",
  "refresh": "refresh_token_here",
  "user": {...}
}
```

### Authenticated Requests
Include JWT token in headers:
```bash
Authorization: Bearer your_jwt_token_here
```

## Notes

- **Pagination**: All list endpoints support pagination (default: 20 items/page)
- **Authentication**: Most endpoints require JWT authentication
- **Content-Type**: Use `application/json` for POST/PUT requests
- **CORS**: Enabled for `localhost:8080` and `127.0.0.1:8080`

## Testing

Use tools like:
- **cURL**: Command-line testing
- **Postman**: GUI-based API testing
- **Django Admin**: `/admin/` for data management

---

For detailed API documentation, see individual endpoint files or use Django REST Framework's browsable API at `http://localhost:8000/api/`
