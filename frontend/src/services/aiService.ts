const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface AIInsight {
  id: string;
  type: 'positive' | 'warning' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  metric?: string;
}

interface AIServiceResponse {
  success: boolean;
  insights: AIInsight[];
  page_type: string;
  total_insights: number;
  error?: string;
}

class AIService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async generateInsights(visibleData: Record<string, unknown>, pageType: string, count: number = 3, language: string = 'en'): Promise<AIInsight[]> {
    try {
      console.log(`🔄 Calling Django API for ${count} ${pageType} insights in ${language}...`);

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${API_BASE_URL}/ai-insights/generate/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          visible_data: visibleData,
          page_type: pageType,
          count: count,
          language: language,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        if (response.status === 503) {
          console.warn('⚠️ AI service not configured on backend');
          throw new Error('AI service not configured on backend');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AIServiceResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate insights');
      }

      console.log(`✅ Received ${data.total_insights} insights from Django API`);
      return data.insights;

    } catch (error) {
      console.error('❌ Error calling AI service:', error);
      throw error;
    }
  }

  async checkServiceStatus(): Promise<{ available: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai-insights/status/`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        return {
          available: false,
          message: 'Unable to check service status',
        };
      }

      const data = await response.json();
      return {
        available: data.service_available,
        message: data.message,
      };

    } catch (error) {
      console.error('Error checking AI service status:', error);
      return {
        available: false,
        message: 'Service status check failed',
      };
    }
  }
}

export const aiService = new AIService();
export default aiService;