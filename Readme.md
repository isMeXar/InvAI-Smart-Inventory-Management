# 📦 InvAI - Intelligent Inventory Management System

A modern, full-stack inventory management solution designed to streamline product tracking, supplier management, and order processing for businesses of all sizes.

## 🎯 Project Overview

InvAI combines powerful backend functionality with an intuitive frontend interface to solve common inventory management challenges. The system provides real-time stock monitoring, automated alerts for low inventory, comprehensive supplier management, and detailed analytics to help businesses make data-driven inventory decisions.

## ⚡ Features

- **🌍 Multi-Language Support**
  - English, German (Deutsch), and French language support
  - Complete UI translations and localization

- **🌓 Dark/Light Theme Support**
  - Automatic system theme detection
  - Manual theme switching
  - Persistent theme preferences

- **📱 Responsive Design**
  - Mobile-first approach with Tailwind CSS
  - Cross-device compatibility
  - Modern UI components with shadcn/ui

- **🏠 Professional Landing Page**
  - Marketing-focused homepage
  - Feature highlights and demonstrations
  - Clean, professional design

- **💼 Complete ERP Management System**
  - User management with role-based access
  - Product inventory tracking
  - Supplier relationship management
  - Order processing and analytics
  - Real-time dashboard with insights
  - Smart notification system with real-time alerts

- **📊 Advanced Analytics & Visualizations**
  - Interactive charts and data visualization
  - AI-powered insights and recommendations
  - Performance tracking and reporting

- **🛡️ Enterprise Security**
  - JWT-based authentication
  - Role-based permissions (Admin, Manager, Employee)
  - Secure API endpoints

## 🛠️ Tech Stack

### 🎨 Frontend
- **⚛️ React 18** with TypeScript
- **⚡ Vite** for fast development and building
- **🎨 Tailwind CSS** for styling
- **🎭 shadcn/ui** for modern UI components
- **🔄 React Query** for state management and API caching
- **🧭 React Router** for navigation
- **📊 Chart.js & Recharts** for data visualization

### ⚙️ Backend
- **🐍 Django 5.2** with Django REST Framework
- **🐘 PostgreSQL** for database
- **🔐 JWT Authentication** for secure access
- **🌐 CORS** support for frontend integration

## 🚀 Setup Guide

### 📋 Prerequisites
- 🐍 Python 3.8+
- 🟢 Node.js 16+
- 🐘 PostgreSQL 12+

### 🔧 Backend Setup

1. **Clone the repository and navigate to backend**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure PostgreSQL database**
   - Create a PostgreSQL database
   - Update `settings.py` with your database credentials:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'your_database_name',
           'USER': 'your_username',
           'PASSWORD': 'your_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```

5. **Run migrations and create superuser**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser
   ```

6. **Populate database with sample data (optional)**
   ```bash
   python manage.py populate_data
   python manage.py create_sample_notifications --count 15
   ```

7. **Start the backend server**
   ```bash
   python manage.py runserver
   ```

### 🎨 Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

The application will be available at:
- 🎨 Frontend: `http://localhost:8080`
- ⚙️ Backend API: `http://localhost:8000`
- 🔧 Django Admin: `http://localhost:8000/admin`


## 🔮 Future Enhancements

### Coming Soon (High Priority)

- **🔔 Real-time Notification System** ✅
  - Smart alerts for inventory changes and user actions
  - In-app notification center with advanced management

- **🤖 AI Insights**
  - Intelligent demand forecasting
  - Automated reorder suggestions
  - Market trend analysis using open-source LLM integration

### Later / Optional

- **📊 Advanced Forecasting**
  - Seasonal demand prediction
  - Supplier lead time optimization
  - Cost analysis and budgeting tools

- **💬 Internal Messaging Service**
  - Team communication within the platform
  - Task assignments and notifications
  - Collaborative inventory planning

- **🔗 Additional Integrations**
  - Barcode scanning support
  - Third-party e-commerce platform integration
  - Export capabilities (PDF, Excel)

## 🤝 Contributing

We welcome contributions! Whether you want to:
- 🐛 Report bugs or suggest features
- 🍴 Fork the project for your own use
- 🔧 Submit pull requests for improvements

Feel free to create issues or submit PRs. For major changes, please open an issue first to discuss your ideas.

## 📄 License

Please check with the project owner regarding licensing terms.