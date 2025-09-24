from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.db import models
from inventory.models import Product, Order
from .services import NotificationService
from .models import NotificationType

User = get_user_model()

@receiver(post_save, sender=User)
def welcome_new_user(sender, instance, created, **kwargs):
    """Send welcome notification to new users"""
    if created:
        NotificationService.create_notification(
            recipient=instance,
            title="Welcome to InvAI! 🎉",
            message=f"Welcome {instance.first_name or instance.username}! Your inventory management account is ready. Explore the dashboard to get started.",
            notification_type=NotificationType.SUCCESS,
            action_url='/dashboard',
            action_text='Get Started'
        )

        # Notify admins about new user
        admin_users = User.objects.filter(role='Admin').exclude(id=instance.id)
        for admin in admin_users:
            NotificationService.create_notification(
                recipient=admin,
                title="New User Registered",
                message=f"New user '{instance.username}' ({instance.email}) has joined the system.",
                notification_type=NotificationType.USER_ACTION,
                action_url='/dashboard/users',
                action_text='Manage Users'
            )

@receiver(post_save, sender=Product)
def product_created_notification(sender, instance, created, **kwargs):
    """Send notification when a new product is added"""
    if created:
        # Notify all admin/manager users about new product
        admin_users = User.objects.filter(role__in=['Admin', 'Manager'])
        for user in admin_users:
            NotificationService.create_notification(
                recipient=user,
                title="New Product Added",
                message=f"New product '{instance.name}' has been added to inventory with {instance.quantity} units in stock.",
                notification_type=NotificationType.SUCCESS,
                related_object_id=instance.id,
                related_object_type='product',
                action_url='/dashboard/products',
                action_text='View Products'
            )

@receiver(pre_save, sender=Product)
def check_stock_level(sender, instance, **kwargs):
    """Check if product stock level changed and send notifications"""
    if instance.pk:  # Only for updates, not new products
        try:
            old_product = Product.objects.get(pk=instance.pk)
            old_quantity = old_product.quantity
            new_quantity = instance.quantity

            # Stock decreased significantly (by 20% or more)
            if new_quantity < old_quantity * 0.8:
                admin_users = User.objects.filter(role__in=['Admin', 'Manager'])
                for user in admin_users:
                    NotificationService.create_notification(
                        recipient=user,
                        title="Stock Level Decreased",
                        message=f"Stock for '{instance.name}' decreased from {old_quantity} to {new_quantity} units.",
                        notification_type=NotificationType.WARNING,
                        related_object_id=instance.id,
                        related_object_type='product',
                        action_url='/dashboard/products',
                        action_text='Check Product'
                    )

            # Check if we crossed into low stock territory
            if old_quantity >= instance.min_stock and new_quantity < instance.min_stock:
                # Low stock alert for all relevant users
                all_users = User.objects.all()
                for user in all_users:
                    NotificationService.create_notification(
                        recipient=user,
                        title="Low Stock Alert",
                        message=f"'{instance.name}' is running low! Current stock: {new_quantity}, minimum required: {instance.min_stock}",
                        notification_type=NotificationType.INVENTORY_LOW,
                        related_object_id=instance.id,
                        related_object_type='product',
                        action_url='/dashboard/products',
                        action_text='Reorder Now'
                    )

            # Critical stock level (below 5 units)
            elif new_quantity <= 5 and old_quantity > 5:
                admin_users = User.objects.filter(role__in=['Admin', 'Manager'])
                for user in admin_users:
                    NotificationService.create_notification(
                        recipient=user,
                        title="CRITICAL: Stock Almost Empty",
                        message=f"URGENT: '{instance.name}' has only {new_quantity} units left! Immediate reordering required.",
                        notification_type=NotificationType.ERROR,
                        related_object_id=instance.id,
                        related_object_type='product',
                        action_url='/dashboard/products',
                        action_text='Emergency Reorder'
                    )

        except Product.DoesNotExist:
            pass

@receiver(post_save, sender=Order)
def order_status_notification(sender, instance, created, **kwargs):
    """Send notifications for order status changes"""
    if created:
        # New order created
        NotificationService.create_notification(
            recipient=instance.user,
            title="Order Placed Successfully",
            message=f"Your order for {instance.quantity}x '{instance.product.name}' has been placed successfully.",
            notification_type=NotificationType.SUCCESS,
            related_object_id=instance.id,
            related_object_type='order',
            action_url='/dashboard/orders',
            action_text='Track Order'
        )

        # Notify admins about new order
        admin_users = User.objects.filter(role__in=['Admin', 'Manager'])
        for user in admin_users:
            NotificationService.create_notification(
                recipient=user,
                title="New Order Received",
                message=f"New order #{instance.id} for {instance.quantity}x '{instance.product.name}' from {instance.user.username}",
                notification_type=NotificationType.ORDER_STATUS,
                related_object_id=instance.id,
                related_object_type='order',
                action_url='/dashboard/orders',
                action_text='Process Order'
            )
    else:
        # Order status updated
        try:
            # Get the old order to compare status
            old_order = Order.objects.get(pk=instance.pk)
            if hasattr(old_order, '_original_status'):
                old_status = old_order._original_status
            else:
                return

            if old_status != instance.status:
                # Notify the customer about status change
                NotificationService.create_notification(
                    recipient=instance.user,
                    title=f"Order {instance.status}",
                    message=f"Your order #{instance.id} for '{instance.product.name}' is now {instance.status.lower()}.",
                    notification_type=NotificationType.ORDER_STATUS,
                    related_object_id=instance.id,
                    related_object_type='order',
                    action_url='/dashboard/orders',
                    action_text='View Order'
                )

                # Special notification for delivered orders
                if instance.status == 'Delivered':
                    NotificationService.create_notification(
                        recipient=instance.user,
                        title="Order Delivered! 🎉",
                        message=f"Your order #{instance.id} for '{instance.product.name}' has been delivered successfully. Thank you for your business!",
                        notification_type=NotificationType.SUCCESS,
                        related_object_id=instance.id,
                        related_object_type='order',
                        action_url='/dashboard/orders',
                        action_text='Leave Review'
                    )
        except Order.DoesNotExist:
            pass

# Track original status before saving
@receiver(pre_save, sender=Order)
def track_order_status(sender, instance, **kwargs):
    """Track original order status for comparison"""
    if instance.pk:
        try:
            old_order = Order.objects.get(pk=instance.pk)
            instance._original_status = old_order.status
        except Order.DoesNotExist:
            pass

# System notifications for regular maintenance
def create_system_notifications():
    """Create system-wide notifications (can be called by management commands)"""
    all_users = User.objects.all()

    # Check for products that need reordering across the entire inventory
    low_stock_products = Product.objects.filter(quantity__lt=models.F('min_stock'))
    if low_stock_products.exists():
        admin_users = User.objects.filter(role__in=['Admin', 'Manager'])
        for user in admin_users:
            product_names = ', '.join([p.name for p in low_stock_products[:5]])
            more_text = f" and {low_stock_products.count() - 5} more" if low_stock_products.count() > 5 else ""

            NotificationService.create_notification(
                recipient=user,
                title=f"Weekly Stock Review: {low_stock_products.count()} Items Need Attention",
                message=f"Products requiring reorder: {product_names}{more_text}",
                notification_type=NotificationType.WARNING,
                action_url='/dashboard/products',
                action_text='Review Inventory'
            )

# User-specific notifications based on their activity
def create_user_activity_notifications(user):
    """Create personalized notifications based on user's orders and activity"""
    recent_orders = user.orders.filter(status='Delivered').order_by('-updated_at')[:3]

    if recent_orders.exists():
        # Suggest reordering based on previous purchases
        for order in recent_orders:
            if order.product.quantity < order.product.min_stock:
                NotificationService.create_notification(
                    recipient=user,
                    title="Reorder Suggestion",
                    message=f"'{order.product.name}' (which you ordered before) is running low. Consider reordering?",
                    notification_type=NotificationType.INFO,
                    related_object_id=order.product.id,
                    related_object_type='product',
                    action_url='/dashboard/products',
                    action_text='Reorder Now'
                )