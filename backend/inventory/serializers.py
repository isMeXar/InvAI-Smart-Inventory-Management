from rest_framework import serializers
from .models import Supplier, Product, Order
from accounts.serializers import UserSerializer

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'contact', 'phone', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ProductSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    stock_level = serializers.CharField(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'quantity', 'price', 'supplier', 'supplier_name',
                 'min_stock', 'description', 'stock_level', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'stock_level']

class OrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'product', 'product_name', 'user', 'user_name', 'quantity',
                 'status', 'total_price', 'date', 'updated_at']
        read_only_fields = ['id', 'date', 'updated_at', 'total_price']