#!/usr/bin/env python
"""List all notification URLs"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings')
django.setup()

from django.urls import get_resolver
from django.urls.resolvers import URLPattern, URLResolver

def list_urls(lis, acc=None):
    if acc is None:
        acc = []
    if not lis:
        return
    l = lis[0]
    if isinstance(l, URLPattern):
        yield acc + [str(l.pattern)]
    elif isinstance(l, URLResolver):
        yield from list_urls(l.url_patterns, acc + [str(l.pattern)])
    yield from list_urls(lis[1:], acc)

print("=" * 60)
print("NOTIFICATION API URLS")
print("=" * 60)

resolver = get_resolver()
all_urls = list(list_urls(resolver.url_patterns))

notification_urls = [url for url in all_urls if 'notification' in ''.join(url).lower()]

print("\nNotification-related URLs:")
for url_parts in notification_urls:
    full_url = ''.join(url_parts)
    print(f"  /{full_url}")

print("\n" + "=" * 60)
