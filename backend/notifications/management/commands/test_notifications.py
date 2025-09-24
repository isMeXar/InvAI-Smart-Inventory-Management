from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from inventory.models import Product, Supplier, Order

User = get_user_model()

class Command(BaseCommand):
    help = 'Test notification system with real inventory events'

    def handle(self, *args, **options):
        # Get or create a supplier
        supplier, _ = Supplier.objects.get_or_create(
            name="Test Supplier",
            defaults={
                'contact': 'test@supplier.com',
                'phone': '555-0123'
            }
        )

        # Test 1: Create a new product (should trigger notification)
        self.stdout.write("Creating new product...")
        product = Product.objects.create(
            name="Test Widget Pro",
            category="Electronics",
            quantity=100,
            price=29.99,
            supplier=supplier,
            min_stock=20,
            description="A test product to trigger notifications"
        )
        self.stdout.write(self.style.SUCCESS(f"Created product: {product.name}"))

        # Test 2: Update product to trigger low stock alert
        self.stdout.write("Reducing stock to trigger low stock alert...")
        product.quantity = 15  # Below min_stock of 20
        product.save()
        self.stdout.write(self.style.WARNING(f"Reduced stock to {product.quantity}"))

        # Test 3: Reduce to critical level
        self.stdout.write("Reducing to critical stock level...")
        product.quantity = 3  # Critical level
        product.save()
        self.stdout.write(self.style.ERROR(f"Critical stock level: {product.quantity}"))

        # Test 4: Create an order
        user = User.objects.first()
        if user:
            self.stdout.write("Creating test order...")
            order = Order.objects.create(
                product=product,
                user=user,
                quantity=2,
                status='Pending'
            )
            self.stdout.write(self.style.SUCCESS(f"Created order #{order.id}"))

            # Test 5: Update order status
            self.stdout.write("Updating order status...")
            order.status = 'Shipped'
            order.save()
            self.stdout.write(self.style.SUCCESS("Order marked as shipped"))

            order.status = 'Delivered'
            order.save()
            self.stdout.write(self.style.SUCCESS("Order marked as delivered"))

        self.stdout.write(
            self.style.SUCCESS(
                "\n✅ Notification tests completed! Check the notification system for new alerts."
            )
        )