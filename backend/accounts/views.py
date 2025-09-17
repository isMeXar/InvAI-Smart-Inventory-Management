from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import base64
import uuid
from .models import User
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Temporarily allow all

    @action(detail=False, methods=['get'])
    def me(self, request):
        if request.user.is_authenticated:
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        else:
            return Response({
                'error': 'Not authenticated'
            }, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        if not request.user.is_authenticated:
            return Response({
                'error': 'Not authenticated'
            }, status=status.HTTP_401_UNAUTHORIZED)

        user = request.user
        data = request.data

        # Update basic fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            user.email = data['email']
        if 'phone' in data:
            user.phone = data['phone']

        # Handle profile picture upload
        if 'profile_pic' in data:
            profile_pic_data = data['profile_pic']
            if profile_pic_data.startswith('data:image'):
                # Extract base64 data
                format, imgstr = profile_pic_data.split(';base64,')
                ext = format.split('/')[-1]

                # Generate unique filename
                filename = f"profile_pics/{user.id}_{uuid.uuid4().hex}.{ext}"

                # Save file
                file_content = ContentFile(base64.b64decode(imgstr))
                saved_path = default_storage.save(filename, file_content)

                # Update user profile pic URL
                user.profile_pic = f"/media/{saved_path}"
            else:
                # If it's already a URL, just save it
                user.profile_pic = profile_pic_data

        user.save()

        serializer = self.get_serializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        if not request.user.is_authenticated:
            return Response({
                'error': 'Not authenticated'
            }, status=status.HTTP_401_UNAUTHORIZED)

        from inventory.models import Order
        from django.db.models import Sum, Count, Q

        user = request.user
        user_orders = Order.objects.filter(user=user)

        # Calculate total orders and revenue
        total_orders = user_orders.count()
        total_revenue = user_orders.aggregate(
            total=Sum('product__price') * Sum('quantity')
        )['total'] or 0

        # Calculate orders by status
        orders_by_status = user_orders.values('status').annotate(count=Count('id'))

        # Calculate favorite categories
        from django.db.models import F
        categories = user_orders.values('product__category').annotate(
            count=Count('id'),
            revenue=Sum(F('product__price') * F('quantity'))
        ).order_by('-count')[:5]

        # Calculate monthly order history for the current year
        from datetime import datetime, timezone
        import calendar
        current_year = datetime.now().year
        monthly_data = []

        for month in range(1, 13):
            month_orders = user_orders.filter(
                date__year=current_year,
                date__month=month
            ).count()
            monthly_data.append({
                'month': calendar.month_abbr[month],
                'orders': month_orders
            })

        return Response({
            'total_orders': total_orders,
            'total_revenue': total_revenue,
            'orders_by_status': list(orders_by_status),
            'favorite_categories': list(categories),
            'monthly_orders': monthly_data
        })

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        user = User.objects.get(email=email)
        if user.check_password(password):
            login(request, user)
            serializer = UserSerializer(user)
            return Response({
                'user': serializer.data,
                'message': 'Login successful'
            })
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return Response({
            'error': 'User not found'
        }, status=status.HTTP_404_NOT_FOUND)

@csrf_exempt
@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logout successful'})
