import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'info';
  title: string;
  description: string;
  metric?: string;
  impact: 'high' | 'medium' | 'low';
}

interface AIInsightsProps {
  data: any[];
  pageType: 'dashboard' | 'users' | 'products' | 'suppliers' | 'orders' | 'forecasts' | 'profile';
}

const AIInsights: React.FC<AIInsightsProps> = ({ data, pageType }) => {
  const { t } = useLanguage();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateInsights = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedInsights = getInsightsForPage(pageType, data);
    setInsights(generatedInsights);
    setIsLoading(false);
  };

  const getInsightsForPage = (page: string, data: any[]): Insight[] => {
    switch (page) {
      case 'dashboard':
        return [
          {
            id: '1',
            type: 'positive',
            title: 'Revenue Growth Trend',
            description: 'Revenue has increased by 15% this month, primarily driven by electronics sales.',
            metric: '+15%',
            impact: 'high'
          },
          {
            id: '2',
            type: 'warning',
            title: 'Inventory Alert',
            description: '3 products are running low on stock and may need reordering soon.',
            impact: 'medium'
          }
        ];
      
      case 'users':
        return [
          {
            id: '1',
            type: 'info',
            title: 'Team Composition',
            description: 'Managers represent only 10% of your workforce. Consider promoting high-performing employees.',
            impact: 'medium'
          },
          {
            id: '2',
            type: 'positive',
            title: 'User Engagement',
            description: 'Employee productivity has increased by 8% this quarter.',
            metric: '+8%',
            impact: 'high'
          }
        ];
      
      case 'products':
        return [
          {
            id: '1',
            type: 'positive',
            title: 'Top Performers',
            description: 'Top 3 products generate 70% of total revenue. Focus marketing efforts on similar items.',
            metric: '70%',
            impact: 'high'
          },
          {
            id: '2',
            type: 'warning',
            title: 'Profit Margin Alert',
            description: 'Office supplies have the lowest profit margin at 12%. Consider price adjustments.',
            impact: 'medium'
          }
        ];
      
      case 'suppliers':
        return [
          {
            id: '1',
            type: 'warning',
            title: 'Supplier Dependency',
            description: 'TechSource Ltd accounts for 60% of electronics revenue. High dependency risk detected.',
            impact: 'high'
          },
          {
            id: '2',
            type: 'info',
            title: 'Cost Optimization',
            description: 'Consider diversifying suppliers to reduce costs and improve reliability.',
            impact: 'medium'
          }
        ];
      
      case 'orders':
        return [
          {
            id: '1',
            type: 'warning',
            title: 'Order Processing',
            description: 'Pending orders increased by 25% this week. Review processing workflows.',
            metric: '+25%',
            impact: 'medium'
          },
          {
            id: '2',
            type: 'positive',
            title: 'Customer Satisfaction',
            description: 'Delivered orders maintain 95% customer satisfaction rate.',
            metric: '95%',
            impact: 'high'
          }
        ];
      
      case 'forecasts':
        return [
          {
            id: '1',
            type: 'positive',
            title: 'Demand Prediction',
            description: 'Predicted demand for laptops will double next quarter. Increase inventory.',
            metric: '+100%',
            impact: 'high'
          },
          {
            id: '2',
            type: 'info',
            title: 'Seasonal Trends',
            description: 'Electronics demand peaks in October. Plan procurement accordingly.',
            impact: 'medium'
          }
        ];
      
      case 'profile':
        return [
          {
            id: '1',
            type: 'info',
            title: 'Purchase Pattern',
            description: 'You primarily order electronics, representing 80% of your purchases.',
            metric: '80%',
            impact: 'low'
          },
          {
            id: '2',
            type: 'positive',
            title: 'Order Efficiency',
            description: 'Your average order processing time is 20% faster than company average.',
            metric: '+20%',
            impact: 'medium'
          }
        ];
      
      default:
        return [];
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      default:
        return <TrendingUp className="h-5 w-5 text-primary" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="mt-8 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          {t.aiInsights}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {t.generateAiInsights}
            </p>
            <Button 
              onClick={generateInsights} 
              disabled={isLoading}
              className="bg-gradient-primary hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {t.analyzingData}...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t.generateInsights}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg border bg-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground">
                          {insight.title}
                        </h4>
                        {insight.metric && (
                          <Badge variant="secondary" className="text-xs">
                            {insight.metric}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-xs ${getImpactColor(insight.impact)}`}>
                    {insight.impact} impact
                  </Badge>
                </div>
              </motion.div>
            ))}
            
            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={generateInsights}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Refresh Insights
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights;