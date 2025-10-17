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

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

> **Note:** A `.env.example` file is provided. Copy it to `.env` and update with your settings.

### 🔧 Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create PostgreSQL database
psql -U postgres
CREATE DATABASE invai_db;
\q

# 5. Configure environment variables
cp .env.example .env
# Edit .env and update:
# - DB_PASSWORD with your PostgreSQL password
# - GEMINI_API_KEY with your API key (optional, for AI features)

# 6. Run migrations
python manage.py migrate

# 7. Create admin user
python manage.py createsuperuser

# 8. (Optional) Populate with sample data
python manage.py populate_data
python manage.py create_sample_notifications --count 15

# 9. Start server
python manage.py runserver
```

### 🎨 Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

### 🌐 Access the Application

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:8000
- **Admin Panel:** http://localhost:8000/admin

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