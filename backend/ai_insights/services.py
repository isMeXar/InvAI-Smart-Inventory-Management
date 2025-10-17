import os
import json
import logging
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from django.conf import settings

logger = logging.getLogger(__name__)


class GeminiService:
    """Service for generating AI insights using Google Gemini Pro"""

    def __init__(self):
        self.model = None
        self._initialize()

    def _initialize(self):
        """Initialize Gemini Pro with API key"""
        try:
            # Get API key from environment variable
            api_key = os.getenv('GEMINI_API_KEY')
            if not api_key:
                logger.error("GEMINI_API_KEY environment variable not set")
                return

            genai.configure(api_key=api_key)
            # Use gemini-2.0-flash (latest stable flash model)
            # Configure for faster responses
            generation_config = {
                'temperature': 0.7,
                'top_p': 0.95,
                'top_k': 40,
                'max_output_tokens': 1024,
            }
            self.model = genai.GenerativeModel(
                'gemini-2.0-flash',
                generation_config=generation_config
            )
            logger.info("✅ Gemini 2.0 Flash initialized successfully")

        except Exception as e:
            logger.error(f"❌ Failed to initialize Gemini Pro: {e}")
            self.model = None

    def generate_insights(self, visible_data: Dict[str, Any], page_type: str, count: int = 3) -> List[Dict[str, Any]]:
        """
        Generate AI insights based on visible data

        Args:
            visible_data: Dictionary containing the data visible to user
            page_type: Type of page (dashboard, products, users, etc.)
            count: Number of insights to generate (default: 3, max: 10)

        Returns:
            List of insight dictionaries
        """
        if not self.model:
            logger.error("Gemini model not initialized")
            return []

        try:
            # Ensure count is within bounds
            count = max(1, min(count, 10))
            
            logger.info(f"🔄 Generating {count} insights for {page_type}")

            prompt = self._build_prompt(visible_data, page_type, count)
            logger.debug(f"📤 Sending prompt to Gemini: {prompt[:200]}...")

            response = self.model.generate_content(prompt)
            response_text = response.text

            logger.debug(f"📥 Received response: {response_text[:200]}...")

            return self._parse_response(response_text)

        except Exception as e:
            logger.error(f"❌ Error generating insights: {e}")
            return []

    def _build_prompt(self, visible_data: Dict[str, Any], page_type: str, count: int) -> str:
        """Build the prompt for Gemini based on visible data and page type"""

        # Summarize the data to keep prompt concise
        data_summary = self._summarize_data(visible_data, page_type)

        prompt = f"""Analyze this {page_type} data and return {count} business insights as JSON only.

DATA: {data_summary}

Return ONLY a JSON array with {count} objects:
[{{"type":"positive|warning|info","title":"specific title","description":"actionable insight with numbers","impact":"high|medium|low","metric":"key metric"}}]

Requirements: Use actual numbers, prioritize by impact, be concise."""

        return prompt

    def _summarize_data(self, data: Dict[str, Any], page_type: str) -> str:
        """Summarize the visible data for the prompt"""

        try:
            if page_type == 'dashboard':
                total_products = data.get('totalCounts', {}).get('products', 0)
                total_orders = data.get('totalCounts', {}).get('orders', 0)
                total_users = data.get('totalCounts', {}).get('users', 0)
                low_stock = data.get('lowStockProductsCount', 0)
                recent_orders = len(data.get('recentOrders', []))

                return f"Dashboard Overview: {total_products} total products, {total_orders} total orders, {total_users} users, {low_stock} products with low stock, {recent_orders} recent orders visible"

            elif page_type == 'products':
                total = data.get('totalProducts', 0)
                displayed = data.get('displayedProducts', 0)
                low_stock = data.get('lowStockCount', 0)
                category = data.get('selectedCategory', 'all')
                search = data.get('searchTerm', '')

                return f"Products Page: Showing {displayed} of {total} products, {low_stock} with low stock, filtered by category '{category}', search term '{search}'"

            elif page_type == 'users':
                total = data.get('totalUsers', 0)
                displayed = data.get('displayedUsers', 0)
                role = data.get('selectedRole', 'all')
                search = data.get('searchTerm', '')
                roles = data.get('roleDistribution', {})

                return f"Users Page: Showing {displayed} of {total} users, filtered by role '{role}', search '{search}', role distribution: {roles}"

            elif page_type == 'orders':
                total = data.get('totalOrders', 0)
                displayed = data.get('displayedOrders', 0)
                status_filter = data.get('statusFilter', 'all')
                statuses = data.get('statusCounts', {})

                return f"Orders Page: Showing {displayed} of {total} orders, filtered by status '{status_filter}', status distribution: {statuses}"

            elif page_type == 'suppliers':
                total = data.get('totalSuppliers', 0)
                displayed = data.get('displayedSuppliers', 0)
                search = data.get('searchTerm', '')

                return f"Suppliers Page: Showing {displayed} of {total} suppliers, search term '{search}'"

            elif page_type == 'profile':
                orders_count = len(data.get('userOrders', []))
                recent_activity = len(data.get('recentActivity', []))

                return f"Profile Page: User has {orders_count} total orders, {recent_activity} recent activities"

            elif page_type == 'forecasts':
                total_forecasts = data.get('totalForecasts', 0)
                trends = data.get('forecastTrends', [])

                return f"Forecasts Page: {total_forecasts} demand forecasts available, trend analysis shows {len(trends)} product predictions"

            else:
                return f"Page {page_type}: General data analysis available"

        except Exception as e:
            logger.error(f"Error summarizing data: {e}")
            return f"Basic {page_type} data available for analysis"

    def _parse_response(self, response_text: str) -> List[Dict[str, Any]]:
        """Parse Gemini response into structured insights"""

        try:
            # Clean up the response
            response_text = response_text.strip()

            # Remove code blocks if present
            if '```json' in response_text:
                start = response_text.find('```json') + 7
                end = response_text.find('```', start)
                response_text = response_text[start:end].strip()
            elif '```' in response_text:
                start = response_text.find('```') + 3
                end = response_text.find('```', start)
                response_text = response_text[start:end].strip()

            # Find JSON array in response
            if '[' in response_text and ']' in response_text:
                start = response_text.find('[')
                end = response_text.rfind(']') + 1
                response_text = response_text[start:end]

            # Parse JSON
            insights = json.loads(response_text)

            if not isinstance(insights, list):
                logger.error("Response is not a list")
                return []

            # Validate and format insights
            formatted_insights = []
            for i, insight in enumerate(insights):
                if not isinstance(insight, dict):
                    continue

                formatted_insight = {
                    'id': f'ai-{hash(str(insight))}-{i}',
                    'type': insight.get('type', 'info'),
                    'title': insight.get('title', 'AI Insight'),
                    'description': insight.get('description', 'Generated insight'),
                    'impact': insight.get('impact', 'medium'),
                    'metric': insight.get('metric')
                }
                formatted_insights.append(formatted_insight)

            logger.info(f"✅ Successfully generated {len(formatted_insights)} insights")
            return formatted_insights

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Raw response: {response_text}")
            return []
        except Exception as e:
            logger.error(f"Error parsing response: {e}")
            return []

    def is_configured(self) -> bool:
        """Check if Gemini service is properly configured"""
        return self.model is not None


# Global instance
gemini_service = GeminiService()