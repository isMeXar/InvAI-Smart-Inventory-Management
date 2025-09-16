from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from .models import Supplier, Product, Order
from .serializers import SupplierSerializer, ProductSerializer, OrderSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related('supplier')
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        products = self.queryset.filter(quantity__lt=50)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total_products = self.queryset.count()
        low_stock_count = self.queryset.filter(quantity__lt=50).count()
        categories = self.queryset.values('category').annotate(count=Count('id'))

        return Response({
            'total_products': total_products,
            'low_stock_count': low_stock_count,
            'categories': list(categories)
        })

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().select_related('product', 'user')
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total_orders = self.queryset.count()
        pending_orders = self.queryset.filter(status='Pending').count()
        delivered_orders = self.queryset.filter(status='Delivered').count()

        return Response({
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'delivered_orders': delivered_orders
        })
