#!/usr/bin/env python
"""Test notification system - check DB and API"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from notifications.models import Notification
from accounts.models import User
from django.test import Client
import json

print("=" * 60)
print("NOTIFICATION SYSTEM TEST")
print("=" * 60)

# 1. Check database
print("\n1. DATABASE CHECK")
print("-" * 60)
total = Notification.objects.count()
print(f"✅ Total notifications in DB: {total}")

if total > 0:
    print("\n   Recent notifications:")
    recent = Notification.objects.order_by('-created_at')[:5]
    for n in recent:
        status = "✓ Read" if n.is_read else "• Unread"
        print(f"     {status} - {n.recipient.username}: {n.title}")
        print(f"              Type: {n.notification_type}, Created: {n.created_at}")
else:
    print("   ⚠️  No notifications found in database")

# 2. Check API endpoints
print("\n2. API ENDPOINT TEST")
print("-" * 60)

# Get a user to test with
try:
    test_user = User.objects.filter(role__in=['Admin', 'Manager']).first()
    if not test_user:
        test_user = User.objects.first()
    
    print(f"   Testing with user: {test_user.username} ({test_user.role})")
    
    # Create test client and login
    client = Client()
    client.force_login(test_user)
    
    # Test GET /api/notifications/
    print("\n   Testing: GET /api/notifications/")
    response = client.get('/api/notifications/notifications/')
    print(f"   Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ API Response: {len(data)} notifications returned")
        if len(data) > 0:
            print(f"\n   First notification:")
            first = data[0]
            print(f"     Title: {first.get('title')}")
            print(f"     Message: {first.get('message')[:50]}...")
            print(f"     Type: {first.get('notification_type')}")
            print(f"     Read: {first.get('is_read')}")
    else:
        print(f"   ❌ API Error: {response.status_code}")
        print(f"   Response: {response.content.decode()[:200]}")
    
    # Test GET /api/notifications/unread_count/
    print("\n   Testing: GET /api/notifications/notifications/unread_count/")
    response = client.get('/api/notifications/notifications/unread_count/')
    print(f"   Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Unread Count: {data.get('unread_count')}")
    else:
        print(f"   ❌ API Error: {response.status_code}")
    
except Exception as e:
    print(f"   ❌ Error testing API: {str(e)}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
