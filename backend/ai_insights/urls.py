from django.urls import path
from . import views

app_name = 'ai_insights'

urlpatterns = [
    path('generate/', views.generate_insights, name='generate_insights'),
    path('status/', views.service_status, name='service_status'),
]