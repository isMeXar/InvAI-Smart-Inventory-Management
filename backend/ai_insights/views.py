import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .services import gemini_service

logger = logging.getLogger(__name__)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def generate_insights(request):
    """
    Generate AI insights based on visible page data

    POST /api/ai-insights/generate/
    {
        "visible_data": {
            "totalProducts": 100,
            "displayedProducts": 25,
            "lowStockCount": 5,
            ...
        },
        "page_type": "products"
    }
    """
    try:
        visible_data = request.data.get('visible_data', {})
        page_type = request.data.get('page_type', 'dashboard')

        if not visible_data:
            return Response({
                'error': 'visible_data is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not page_type:
            return Response({
                'error': 'page_type is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate page_type
        valid_page_types = ['dashboard', 'products', 'users', 'orders', 'suppliers', 'profile', 'forecasts']
        if page_type not in valid_page_types:
            return Response({
                'error': f'page_type must be one of: {", ".join(valid_page_types)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if Gemini is configured
        if not gemini_service.is_configured():
            return Response({
                'error': 'AI service not configured. Please set GEMINI_API_KEY environment variable.',
                'insights': []
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # Generate insights
        logger.info(f"Generating insights for user {request.user.id}, page: {page_type}")
        insights = gemini_service.generate_insights(visible_data, page_type)

        return Response({
            'success': True,
            'insights': insights,
            'page_type': page_type,
            'total_insights': len(insights)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in generate_insights view: {e}")
        return Response({
            'error': 'Internal server error occurred while generating insights',
            'insights': []
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def service_status(request):
    """
    Check if AI insights service is available

    GET /api/ai-insights/status/
    """
    try:
        is_configured = gemini_service.is_configured()

        return Response({
            'service_available': is_configured,
            'service_name': 'Google Gemini Pro',
            'message': 'AI insights service is ready' if is_configured else 'AI insights service not configured'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error checking service status: {e}")
        return Response({
            'service_available': False,
            'error': 'Error checking service status'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)