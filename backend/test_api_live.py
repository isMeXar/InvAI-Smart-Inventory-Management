#!/usr/bin/env python
"""Test live API endpoints"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 60)
print("LIVE API TEST")
print("=" * 60)

# Test without auth first
print("\n1. Testing GET /api/notifications/notifications/")
try:
    response = requests.get(f"{BASE_URL}/api/notifications/notifications/", timeout=5)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Returned {len(data)} notifications")
        if len(data) > 0:
            print(f"\n   First notification:")
            first = data[0]
            print(f"     Title: {first.get('title')}")
            print(f"     Type: {first.get('notification_type')}")
    elif response.status_code == 403:
        print(f"   ⚠️  Authentication required (expected)")
    else:
        print(f"   Response: {response.text[:200]}")
except requests.exceptions.ConnectionError:
    print("   ❌ Server not running at http://localhost:8000")
except Exception as e:
    print(f"   ❌ Error: {str(e)}")

print("\n2. Testing GET /api/notifications/notifications/unread_count/")
try:
    response = requests.get(f"{BASE_URL}/api/notifications/notifications/unread_count/", timeout=5)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Unread count: {data.get('unread_count')}")
    elif response.status_code == 403:
        print(f"   ⚠️  Authentication required (expected)")
    else:
        print(f"   Response: {response.text[:200]}")
except requests.exceptions.ConnectionError:
    print("   ❌ Server not running")
except Exception as e:
    print(f"   ❌ Error: {str(e)}")

print("\n" + "=" * 60)
print("NOTE: If you see 403 errors, that's expected.")
print("The API requires authentication.")
print("Test with browser console or authenticated requests.")
print("=" * 60)
