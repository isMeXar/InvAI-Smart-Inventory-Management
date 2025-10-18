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

    def generate_insights(self, visible_data: Dict[str, Any], page_type: str, count: int = 3, language: str = 'en') -> List[Dict[str, Any]]:
        """
        Generate AI insights based on visible data

        Args:
            visible_data: Dictionary containing the data visible to user
            page_type: Type of page (dashboard, products, users, etc.)
            count: Number of insights to generate (default: 3, max: 10)
            language: User's current language (en, de, fr)

        Returns:
            List of insight dictionaries
        """
        if not self.model:
            logger.error("Gemini model not initialized")
            return []

        try:
            # Ensure count is within bounds
            count = max(1, min(count, 10))
            
            logger.info(f"🔄 Generating {count} insights for {page_type} in {language}")

            prompt = self._build_prompt(visible_data, page_type, count, language)
            logger.debug(f"📤 Sending prompt to Gemini: {prompt[:200]}...")

            response = self.model.generate_content(prompt)
            response_text = response.text

            logger.debug(f"📥 Received response: {response_text[:200]}...")

            return self._parse_response(response_text)

        except Exception as e:
            logger.error(f"❌ Error generating insights: {e}")
            return []

    def _build_prompt(self, visible_data: Dict[str, Any], page_type: str, count: int, language: str = 'en') -> str:
        """Build the prompt for Gemini with actual raw data for dynamic analysis"""

        # Convert data to JSON for Gemini to analyze
        data_json = json.dumps(visible_data, indent=2, default=str)

        # Language mapping
        language_names = {
            'en': 'English',
            'de': 'German',
            'fr': 'French'
        }
        language_name = language_names.get(language, 'English')

        prompt = f"""You are a business analyst for an inventory management system. Analyze the ACTUAL DATA below and generate {count} SHORT, actionable business insights for a manager.

PAGE TYPE: {page_type}

ACTUAL DATA (analyze this real data):
{data_json}

CRITICAL FORMATTING RULES:
1. Keep insights SHORT - maximum 1-2 lines (one sentence or two short sentences)
2. Include at most 1-2 examples when illustrating a point (e.g., "Keyboard, Mouse" not a full list)
3. Use minimal numbers - only 1-2 key figures if essential to the insight
4. DO NOT include user names, employee names, or overly specific details
5. Focus on BUSINESS MEANING - what the manager needs to know (risks, opportunities, actions)
6. Optionally add a brief suggestion at the end (e.g., "Consider restocking high-demand items")
7. DO NOT explain calculations or reference backend logic
8. DO NOT make up examples or use placeholder names
9. DO NOT mention UI elements, page layout, filters, or technical details
10. Prioritize: CRITICAL issues first (high impact), then patterns (medium), then opportunities (low)

INSIGHT FOCUS BY PAGE TYPE:
- products: Stock levels, stockout risks, best/worst performers, revenue patterns
- suppliers: Dependency concentration, reliability, diversification needs
- orders: Completion rates, fulfillment efficiency, pending revenue, bottlenecks
- users: Workload distribution, activity levels, role balance

GOOD EXAMPLES (short and clear):
✓ "5 products critically low on stock (e.g., Keyboard, Mouse). Immediate restocking recommended."
✓ "Top supplier handles 65% of inventory - high dependency risk. Consider diversifying suppliers."
✓ "Order completion rate at 78% - investigate delays to improve fulfillment efficiency."

BAD EXAMPLES (too long or detailed):
✗ "There are 5 products that have fallen below the critical stock threshold of 20 units, including Keyboard with 12 units, Mouse with 8 units, and Monitor with 15 units remaining in inventory."
✗ "The system shows that supplier ABC Corp provides 15 out of 23 products which equals 65.2% of total inventory."

Return ONLY a valid JSON array with exactly {count} insight objects:
[{{"type":"warning|positive|info","title":"Clear, short title","description":"1-2 line insight with key data and optional brief suggestion","impact":"high|medium|low","metric":"Key metric if relevant"}}]

IMPORTANT: 
- Use ONLY actual data from the JSON above
- Keep descriptions to 1-2 lines maximum
- Include only essential numbers and 1-2 examples max
- Focus on business value, not data enumeration

LANGUAGE INSTRUCTION:
Generate ALL insights (title, description, metric) in {language_name}. The user's interface is in {language_name}, so all text must be in {language_name}.
"""

        return prompt


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