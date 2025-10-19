"""
Quick diagnostic script to test notification signals
Run with: python manage.py shell < test_notification_signals.py
"""

from accounts.models import User
from inventory.models import Product
from notifications.models import Notification

print("\n" + "="*60)
print("NOTIFICATION SYSTEM DIAGNOSTIC")
print("="*60)

# Check if there are any admin/manager users
print("\n1. Checking Users...")
admins = User.objects.filter(role='Admin')
managers = User.objects.filter(role='Manager')
print(f"   - Admin users: {admins.count()}")
for admin in admins:
    print(f"     • {admin.username} ({admin.email})")
print(f"   - Manager users: {managers.count()}")
for manager in managers:
    print(f"     • {manager.username} ({manager.email})")

if admins.count() == 0 and managers.count() == 0:
    print("\n   ⚠️  WARNING: No Admin or Manager users found!")
    print("   Notifications require Admin or Manager users to receive alerts.")
    print("   Create an admin user with: python manage.py createsuperuser")

# Check products
print("\n2. Checking Products...")
products = Product.objects.all()
print(f"   - Total products: {products.count()}")
if products.count() > 0:
    print("\n   Sample products:")
    for product in products[:5]:
        print(f"     • {product.name}: {product.quantity} units (min: {product.min_stock})")

# Check notifications
print("\n3. Checking Existing Notifications...")
notifications = Notification.objects.all().order_by('-created_at')
print(f"   - Total notifications: {notifications.count()}")
if notifications.count() > 0:
    print("\n   Recent notifications:")
    for notif in notifications[:5]:
        status = "✓ Read" if notif.is_read else "• Unread"
        print(f"     {status} - {notif.recipient.username}: {notif.title}")
        print(f"              Type: {notif.notification_type}, Created: {notif.created_at}")

# Check notification preferences
print("\n4. Checking Notification Preferences...")
from notifications.models import NotificationPreference
prefs = NotificationPreference.objects.all()
print(f"   - Users with preferences: {prefs.count()}")

print("\n" + "="*60)
print("MANUAL TEST INSTRUCTIONS")
print("="*60)
print("""
To test stock notifications manually:

1. In Django shell (python manage.py shell):
   
   from inventory.models import Product
   from accounts.models import User
   
   # Get a product
   product = Product.objects.first()
   print(f"Product: {product.name}, Quantity: {product.quantity}")
   
   # Update quantity to trigger notification
   product.quantity = 5
   product.save()
   
   # Check notifications
   from notifications.models import Notification
   recent = Notification.objects.order_by('-created_at')[:3]
   for n in recent:
       print(f"{n.recipient.username}: {n.title}")

2. Or update via API/Frontend:
   - Make sure you're logged in as Admin or Manager
   - Edit a product and reduce quantity below min_stock or to 5 or less
   - Check the notifications bell icon in the UI

3. Check Django logs for any errors during save
""")

print("\n" + "="*60)
print("TROUBLESHOOTING")
print("="*60)
print("""
If notifications still don't appear:

1. ✓ Restart Django server (signals need to be reloaded)
   Ctrl+C and run: python manage.py runserver

2. ✓ Check you're logged in as Admin or Manager
   Employee users don't receive inventory notifications

3. ✓ Verify the product's min_stock value
   Notification only triggers when crossing the threshold

4. ✓ Check browser console for frontend errors
   Open DevTools (F12) and check Console tab

5. ✓ Verify notification preferences
   Go to Notifications page and check settings

6. ✓ Check database directly:
   python manage.py dbshell
   SELECT * FROM notifications_notification ORDER BY created_at DESC LIMIT 5;
""")

print("="*60 + "\n")
