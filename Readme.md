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

## 🚀 Quick Start

### 📋 Prerequisites

- **Python** 3.8 or higher
- **Node.js** 16 or higher  
- **PostgreSQL** 12 or higher
- **Git** (to clone the repository)

> **Note:** A `.env.example` file is provided in the backend folder. Copy it to `.env` and configure your settings.

### 🔧 Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/InvAI-Smart-Inventory-Management.git
cd InvAI-Smart-Inventory-Management

# 2. Navigate to backend
cd backend

# 3. Create virtual environment
python -m venv venv

# 4. Activate virtual environment
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# 5. Install dependencies
pip install -r requirements.txt

# 6. Create PostgreSQL database
psql -U postgres
CREATE DATABASE invai_db;
\q

# 7. Configure environment variables
cp .env.example .env
# Edit .env and update:
# - DB_NAME=invai_db
# - DB_USER=postgres
# - DB_PASSWORD=your_postgresql_password
# - DB_HOST=localhost
# - DB_PORT=5432
# - SECRET_KEY=your_secret_key_here
# - GEMINI_API_KEY=your_api_key (optional, for AI features)

# 8. Run migrations
python manage.py migrate

# 9. Create admin user
python manage.py createsuperuser
# Follow prompts to create username and password

# 10. Populate with sample data (recommended)
python manage.py populate_data
python manage.py create_sample_notifications --count 15

# 11. Start development server
python manage.py runserver
```

✅ Backend should now be running at `http://localhost:8000`

### 🎨 Frontend Setup

**Open a new terminal** (keep backend running)

```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

✅ Frontend should now be running at `http://localhost:8080`

### 🌐 Access the Application

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin

### 👤 Default Login

Use the superuser credentials you created during setup.

### 📚 Additional Documentation

- **[API Endpoints](API_ENDPOINTS.md)** - Complete API reference
- **[AI Insights](AI_INSIGHTS.md)** - AI features setup and usage
- **[Notifications](NOTIFICATIONS.md)** - Notification system guide

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

## 📄 License

MIT License - feel free to use this project for learning and development.

---

**Made with ❤️ using React, Django, and AI**