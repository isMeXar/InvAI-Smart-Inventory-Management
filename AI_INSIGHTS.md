# 🤖 AI Insights Feature

## Overview
AI Insights uses Google Gemini Pro to analyze your inventory data and provide actionable business recommendations in real-time.

## Features

- **Smart Analysis**: Analyzes visible page data (products, orders, users, suppliers)
- **Actionable Insights**: 3-10 insights per request with impact levels
- **Progressive Generation**: Start with 3, generate more as needed (up to 10)
- **Context-Aware**: Different insights for different pages
- **Beautiful UI**: Animated modal with icons and impact badges

## Quick Setup

### 1. Get API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in and create an API key
3. Copy your key

### 2. Configure Backend
Add to `backend/.env`:
```bash
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Restart Server
```bash
cd backend
python manage.py runserver
```

### 4. Verify
Check status:
```bash
curl http://localhost:8000/api/ai-insights/status/
```

Expected response:
```json
{
  "service_available": true,
  "service_name": "Google Gemini Pro", // or other model
  "message": "AI insights service is ready"
}
```

## How to Use

1. Navigate to any page (Dashboard, Products, Orders, etc.)
2. Click the **"AI Insights"** button (sparkle icon ✨)
3. Wait 2-5 seconds for analysis
4. View insights with recommendations
5. Click **"Generate More"** for additional insights (up to 10 total)
6. Click **"Regenerate"** to refresh current insights

## Insight Types

### Type Indicators
- **✅ Positive**: Good performance, opportunities
- **⚠️ Warning**: Issues requiring attention
- **ℹ️ Info**: General observations and patterns

### Impact Levels
- **🔴 High**: Critical, immediate action needed
- **🟡 Medium**: Important, plan action soon
- **🟢 Low**: Informational, monitor over time

## Supported Pages

- **Dashboard**: Overall business metrics and trends
- **Products**: Inventory analysis and stock recommendations
- **Orders**: Order patterns and fulfillment insights
- **Users**: User activity and role distribution
- **Suppliers**: Supplier dependency and performance

## API Usage

### Generate Insights
```bash
POST /api/ai-insights/generate/
Content-Type: application/json

{
  "visible_data": {
    "totalProducts": 100,
    "lowStockCount": 5,
    "recentOrders": [...]
  },
  "page_type": "dashboard",
  "count": 3
}
```

### Response
```json
{
  "success": true,
  "insights": [
    {
      "id": "ai-123456-0",
      "type": "warning",
      "title": "Low Stock Alert",
      "description": "5 products need restocking...",
      "impact": "high",
      "metric": "5% of inventory"
    }
  ],
  "total_insights": 3
}
```

## Troubleshooting

### "AI service not configured"
- Check if `GEMINI_API_KEY` is in `.env`
- Restart Django server
- Verify key is valid

### "Failed to generate insights"
- Check Django logs for errors
- Verify API key hasn't exceeded quota
- Ensure internet connection

### Empty insights
- Check if data is being sent correctly
- Verify `page_type` is valid
- Look for JSON parsing errors in logs

## Performance

- **Response Time**: 2-5 seconds typical
- **Rate Limits**: Gemini Pro free tier limits apply
- **Cost**: Free tier available, monitor usage in Google Cloud Console

## Best Practices

1. **Use Sparingly**: AI calls cost resources, don't spam
2. **Review Insights**: AI suggestions should be validated
3. **Monitor Usage**: Check your API quota regularly
4. **Cache Results**: Consider caching insights for same data

## Future Enhancements

- [ ] Cache insights to reduce API calls
- [ ] Export insights as PDF/CSV
- [ ] Schedule automated reports
- [ ] Multi-language support
- [ ] Insight history tracking

---

**Note**: AI Insights requires a valid Google Gemini API key. The free tier is sufficient for most use cases.
