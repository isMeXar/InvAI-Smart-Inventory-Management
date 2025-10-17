"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

def api_root(request):
    return JsonResponse({
        'message': 'InvAI Backend API',
        'version': '1.0',
        'endpoints': {
            'admin': '/admin/',
            'auth': {
                'login': '/api/auth/login/',
                'logout': '/api/auth/logout/',
                'users': '/api/auth/users/',
            },
            'inventory': {
                'products': '/api/products/',
                'suppliers': '/api/suppliers/',
                'orders': '/api/orders/',
            },
            'ai_insights': {
                'generate': '/api/ai-insights/generate/',
                'status': '/api/ai-insights/status/',
            },
            'notifications': {
                'list': '/api/notifications/',
                'preferences': '/api/notifications/preferences/',
            }
        }
    })

urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('inventory.urls')),
    path('api/ai-insights/', include('ai_insights.urls')),
    path('api/notifications/', include('notifications.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
