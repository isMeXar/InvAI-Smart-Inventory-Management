# 📦 InvAI - Smart Inventory Management System

> A modern, AI-powered inventory management platform with real-time analytics, intelligent insights, and beautiful UI.

## 🎯 Overview

InvAI streamlines inventory operations with smart automation, real-time tracking, and AI-powered insights. Built with React + Django, it offers a complete solution for product management, supplier relationships, order processing, and business intelligence.

## ✨ Main Features

### 🎨 **Modern UI/UX**

- 🌓 Dark/Light theme with auto-detection
- 🌍 Multi-language (English, German, French)
- 📱 Fully responsive design
- ✨ Beautiful animations with Framer Motion

### 💼 **Core Management**
- 📦 Product inventory tracking with low-stock alerts
- 🏢 Supplier management and relationships
- 📋 Order processing with status tracking
- 👥 User management with role-based access (Admin, Manager, Employee)
- 🔔 Real-time notification system

### 📊 **Analytics & Intelligence**
- 📈 Interactive dashboard with live metrics
- 🤖 AI-powered insights (Google Gemini integration)
- 📊 Advanced charts and visualizations
- 🎯 Performance tracking and reporting

### 🔒 **Security**
- 🔐 JWT authentication
- 🛡️ Role-based permissions
- 🔒 Secure API endpoints

## 🛠️ Tech Stack

**Frontend:** React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion  
**Backend:** Django 5.2, Django REST Framework, PostgreSQL  
**AI:** Google Gemini Pro API  
**Auth:** JWT Authentication

## 🚀 Quick Start with Docker

### Prerequisites

- **Docker Desktop** installed ([Download here](https://www.docker.com/products/docker-desktop))
- **Git** (to clone the repository)

### Setup (3 Simple Steps!)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/InvAI-Smart-Inventory-Management.git
cd InvAI-Smart-Inventory-Management

# 2. (Optional) Add your Gemini API key for AI features
echo "GEMINI_API_KEY=your_api_key_here" > .env

# 3. Start all services with Docker Compose
docker-compose up --build
```

**That's it!** Wait for the containers to start (first time takes a few minutes).

### 🌐 Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin

### 👤 Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

### ✨ What Docker Does Automatically

- ✅ Installs PostgreSQL database
- ✅ Runs all migrations
- ✅ Creates admin user
- ✅ Populates sample data (products, orders, suppliers, notifications)
- ✅ Configures all services and networking

### 📚 Additional Documentation

- **[API Endpoints](API_ENDPOINTS.md)** - Complete API reference
- **[AI Insights Guide](AI_INSIGHTS_GUIDE.md)** - AI features setup and usage
- **[Notifications](NOTIFICATIONS.md)** - Notification system guide

## 🐳 Docker Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Reset database (fresh start)
docker-compose down -v && docker-compose up --build
```

### Troubleshooting

- **Port conflicts**: Edit `docker-compose.yml` to change port mappings
- **Database issues**: Run `docker-compose down -v && docker-compose up --build`
- **View logs**: Run `docker-compose logs -f backend`

## 🔮 Future Enhancements

- 📊 Advanced demand forecasting with ML
- 📱 Mobile app (React Native)
- 📧 Email notifications and reports
- 📦 Barcode/QR code scanning
- 🔗 E-commerce platform integrations
- 📄 PDF/Excel export capabilities
- 💬 Internal team messaging
- 🌐 Multi-warehouse support

## 🤝 Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs or request features
- 🔧 Submit pull requests
- 💡 Suggest improvements

For major changes, please open an issue first.

---

**Made with ❤️ using React, Django, and AI**