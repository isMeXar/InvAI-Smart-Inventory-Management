from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from inventory.models import Supplier, Product, Order
from decimal import Decimal
from datetime import datetime, timezone

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Create users
        users_data = [
            {"username": "alice", "first_name": "Alice", "last_name": "Johnson", "email": "alice@example.com", "role": "Admin", "phone": "123-456-7890"},
            {"username": "bob", "first_name": "Bob", "last_name": "Smith", "email": "bob@example.com", "role": "Manager", "phone": "987-654-3210"},
            {"username": "charlie", "first_name": "Charlie", "last_name": "Lee", "email": "charlie@example.com", "role": "Employee", "phone": "555-555-5555"},
            {"username": "diana", "first_name": "Diana", "last_name": "Prince", "email": "diana@example.com", "role": "Manager", "phone": "222-333-4444"},
            {"username": "ethan", "first_name": "Ethan", "last_name": "Hunt", "email": "ethan@example.com", "role": "Employee", "phone": "666-777-8888"},
        ]

        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data["username"],
                defaults={
                    **user_data,
                    "profile_pic": f"https://randomuser.me/api/portraits/{'women' if user_data['first_name'] in ['Alice', 'Diana'] else 'men'}/{users_data.index(user_data) + 1}.jpg"
                }
            )
            if created:
                user.set_password('demo123')
                user.save()
                self.stdout.write(f'Created user: {user.username}')

        # Create suppliers
        suppliers_data = [
            {"name": "TechSource Ltd", "contact": "techsource@example.com", "phone": "111-222-3333"},
            {"name": "FurniCo", "contact": "furnico@example.com", "phone": "444-555-6666"},
            {"name": "OfficeMart", "contact": "officemart@example.com", "phone": "777-888-9999"},
        ]

        suppliers = []
        for supplier_data in suppliers_data:
            supplier, created = Supplier.objects.get_or_create(
                name=supplier_data["name"],
                defaults=supplier_data
            )
            suppliers.append(supplier)
            if created:
                self.stdout.write(f'Created supplier: {supplier.name}')

        # Create products
        products_data = [
            {"name": "Laptop Pro", "category": "Electronics", "quantity": 6, "price": Decimal("1200.00"), "supplier": suppliers[0]},
            {"name": "Office Chair", "category": "Furniture", "quantity": 150, "price": Decimal("200.00"), "supplier": suppliers[1]},
            {"name": "Smartphone X", "category": "Electronics", "quantity": 80, "price": Decimal("900.00"), "supplier": suppliers[0]},
            {"name": "Standing Desk", "category": "Furniture", "quantity": 17, "price": Decimal("450.00"), "supplier": suppliers[1]},
            {"name": "Wireless Headphones", "category": "Electronics", "quantity": 120, "price": Decimal("150.00"), "supplier": suppliers[0]},
            {"name": "LED Monitor 27\"", "category": "Electronics", "quantity": 39, "price": Decimal("300.00"), "supplier": suppliers[0]},
            {"name": "Printer Ink", "category": "Office Supplies", "quantity": 96, "price": Decimal("35.00"), "supplier": suppliers[2]},
        ]

        products = []
        for product_data in products_data:
            product, created = Product.objects.get_or_create(
                name=product_data["name"],
                defaults=product_data
            )
            products.append(product)
            if created:
                self.stdout.write(f'Created product: {product.name}')

        # Create orders
        orders_data = [
            {"product": products[0], "user": User.objects.get(username="bob"), "quantity": 2, "status": "Shipped"},
            {"product": products[1], "user": User.objects.get(username="charlie"), "quantity": 5, "status": "Delivered"},
            {"product": products[2], "user": User.objects.get(username="bob"), "quantity": 1, "status": "Delivered"},
            {"product": products[4], "user": User.objects.get(username="diana"), "quantity": 10, "status": "Processing"},
            {"product": products[5], "user": User.objects.get(username="ethan"), "quantity": 3, "status": "Pending"},
            {"product": products[3], "user": User.objects.get(username="charlie"), "quantity": 1, "status": "Delivered"},
            {"product": products[6], "user": User.objects.get(username="ethan"), "quantity": 15, "status": "Shipped"},
        ]

        for order_data in orders_data:
            order, created = Order.objects.get_or_create(
                product=order_data["product"],
                user=order_data["user"],
                quantity=order_data["quantity"],
                defaults=order_data
            )
            if created:
                self.stdout.write(f'Created order: {order}')

        self.stdout.write(self.style.SUCCESS('Successfully populated database with sample data!'))