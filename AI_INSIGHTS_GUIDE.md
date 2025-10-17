# AI Insights Feature - Implementation Guide

## Overview
The AI Insights feature uses Google Gemini Pro to analyze your inventory data and provide actionable business insights. The system analyzes whatever data is visible on the current page and generates intelligent recommendations.

## Features

### ✨ Key Capabilities
- **Dynamic Insight Generation**: Generate 3-10 insights based on visible page data
- **Context-Aware Analysis**: Different insights for different pages (dashboard, products, orders, etc.)
- **Real-time Processing**: Powered by Google Gemini Pro API
- **Progressive Generation**: Start with 3 insights, generate more as needed
- **Beautiful UI**: Modern, animated interface with impact indicators

### 📊 Supported Pages
- **Dashboard**: Overall business metrics and trends
- **Products**: Inventory analysis and stock recommendations
- **Orders**: Order patterns and fulfillment insights
- **Users**: User activity and role distribution
- **Suppliers**: Supplier dependency and performance
- **Profile**: Personal activity insights
- **Forecasts**: Demand prediction analysis

## Setup Instructions

### 1. Get Your Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure the Backend
Add your API key to the `.env` file:
```bash
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Verify Configuration
Check if the service is configured:
```bash
curl http://localhost:8000/api/ai-insights/status/
```

Expected response:
```json
{
  "service_available": true,
  "service_name": "Google Gemini Pro",
  "message": "AI insights service is ready"
}
```

## How It Works

### Backend Flow
1. **Data Collection**: Frontend sends visible page data to backend
2. **Data Summarization**: Backend creates a concise summary of the data
3. **Prompt Generation**: Builds a structured prompt for Gemini
4. **AI Processing**: Gemini analyzes and generates insights
5. **Response Parsing**: Converts AI response to structured JSON
6. **Delivery**: Returns formatted insights to frontend

### Frontend Flow
1. **User Action**: User clicks "Generate AI Insights" button
2. **Data Preparation**: Collects all visible data on current page
3. **API Call**: Sends data to backend with page type and count
4. **Loading State**: Shows animated loading indicator
5. **Display Results**: Renders insights with icons and impact badges
6. **Progressive Loading**: User can generate more insights (up to 10)

## API Usage

### Generate Insights
```bash
POST /api/ai-insights/generate/
Content-Type: application/json

{
  "visible_data": {
    "totalCounts": {
      "products": 15,
      "orders": 20,
      "users": 3
    },
    "lowStockProductsCount": 3,
    "recentOrders": [...]
  },
  "page_type": "dashboard",
  "count": 3
}
```

### Response Format
```json
{
  "success": true,
  "insights": [
    {
      "id": "ai-123456-0",
      "type": "warning",
      "title": "Low Stock Alert",
      "description": "3 products are running low on stock...",
      "impact": "high",
      "metric": "20% of inventory"
    }
  ],
  "page_type": "dashboard",
  "total_insights": 3,
  "service_available": true
}
```

## Insight Types

### Type Indicators
- **positive** ✅: Good performance, opportunities
- **warning** ⚠️: Issues requiring attention
- **info** ℹ️: General observations and patterns

### Impact Levels
- **high** 🔴: Critical, immediate action needed
- **medium** 🟡: Important, plan action
- **low** 🟢: Informational, monitor

## UI Components

### AI Insights Modal
Located at: `frontend/src/components/AIInsightsModal.tsx`

**Features:**
- Auto-generates insights when opened
- Shows loading animation during generation
- Displays insights with icons and badges
- "Generate More" button (adds 3 more, up to 10)
- "Regenerate" button (refreshes current count)
- Error handling with retry option

### Usage in Pages
```tsx
import AIInsightsModal from '@/components/AIInsightsModal';

const [showAIModal, setShowAIModal] = useState(false);

// Prepare page data
const pageData = {
  totalProducts: products.length,
  displayedProducts: filteredProducts.length,
  lowStockCount: lowStockProducts.length,
  // ... other relevant data
};

// Show modal
<AIInsightsModal
  isOpen={showAIModal}
  onClose={() => setShowAIModal(false)}
  pageType="products"
  pageData={pageData}
/>
```

## Best Practices

### Data Preparation
1. **Include Relevant Metrics**: Send counts, totals, and key statistics
2. **Keep It Concise**: Don't send full arrays, just counts and summaries
3. **Update on Changes**: Refresh data when filters or searches change
4. **Context Matters**: Include filter states (category, status, etc.)

### Example Page Data Structures

**Dashboard:**
```typescript
{
  totalCounts: { products: 15, orders: 20, users: 3 },
  lowStockProductsCount: 3,
  recentOrders: [...] // Array of recent orders
}
```

**Products:**
```typescript
{
  totalProducts: 100,
  displayedProducts: 25,
  lowStockCount: 5,
  selectedCategory: 'Electronics',
  searchTerm: 'laptop'
}
```

**Orders:**
```typescript
{
  totalOrders: 50,
  displayedOrders: 20,
  statusFilter: 'Pending',
  statusCounts: { Pending: 15, Completed: 30, Cancelled: 5 }
}
```

## Troubleshooting

### Common Issues

**1. "AI service not configured"**
- Check if GEMINI_API_KEY is set in .env file
- Restart Django server after adding the key
- Verify key is valid at Google AI Studio

**2. "Failed to generate insights"**
- Check Django server logs for errors
- Verify API key has not exceeded quota
- Ensure internet connection is available

**3. Empty insights returned**
- Check if visible_data is being sent correctly
- Verify page_type is valid
- Look for JSON parsing errors in backend logs

### Debug Mode
Enable detailed logging in Django:
```python
# backend/settings.py
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'ai_insights': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## Performance Considerations

### API Limits
- Gemini Pro has rate limits (check Google AI Studio)
- Consider caching insights for same data
- Implement request throttling if needed

### Response Time
- Typical response: 2-5 seconds
- Depends on data complexity and insight count
- More insights = longer processing time

### Cost
- Gemini Pro API has free tier
- Monitor usage in Google Cloud Console
- Consider implementing usage limits per user

## Future Enhancements

### Planned Features
- [ ] Cache insights to reduce API calls
- [ ] Export insights as PDF/CSV
- [ ] Schedule automated insight reports
- [ ] Custom insight templates
- [ ] Multi-language support
- [ ] Insight history and tracking
- [ ] Action items from insights

## Support

For issues or questions:
1. Check Django server logs: `python manage.py runserver`
2. Check browser console for frontend errors
3. Verify API key configuration
4. Test with sample data using curl/Postman

## Summary

The AI Insights feature provides intelligent, actionable business recommendations by:
- ✅ Analyzing visible page data in real-time
- ✅ Using Google Gemini Pro for advanced AI processing
- ✅ Presenting insights in a beautiful, intuitive UI
- ✅ Supporting progressive insight generation
- ✅ Handling errors gracefully with retry options

**Simple workflow:** User sees data → Clicks AI button → Gets smart insights → Takes action
