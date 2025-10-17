import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle, RotateCcw, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import aiService from '@/services/aiService';

interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'info';
  title: string;
  description: string;
  metric?: string;
  impact: 'high' | 'medium' | 'low';
}

interface AIInsightsProps {
  data: Record<string, unknown>;
  pageType: 'dashboard' | 'users' | 'products' | 'suppliers' | 'orders' | 'profile' | 'forecasts';
}

const AIInsights: React.FC<AIInsightsProps> = ({ data, pageType }) => {
  const { t } = useLanguage();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateInsights = async () => {
    setIsLoading(true);

    try {
      // Call Django API for real AI insights
      const generatedInsights = await aiService.generateInsights(data, pageType);
      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights([]);
    }

    setIsLoading(false);
  };

  const generateMoreInsights = async () => {
    setIsLoading(true);

    try {
      const moreInsights = await aiService.generateInsights(data, pageType);
      setInsights(prev => [...prev, ...moreInsights]);
    } catch (error) {
      console.error('Error generating more insights:', error);
    }

    setIsLoading(false);
  };

  const getInsightIcon = (type: string, title?: string) => {
    const titleLower = title?.toLowerCase() || '';

    if (type === 'positive') {
      if (titleLower.includes('revenue') || titleLower.includes('growth') || titleLower.includes('profit')) {
        return <TrendingUp className="h-5 w-5 text-success" />;
      }
      return <CheckCircle className="h-5 w-5 text-success" />;
    }

    if (type === 'warning') {
      if (titleLower.includes('stock') || titleLower.includes('inventory')) {
        return <AlertCircle className="h-5 w-5 text-warning" />;
      }
      if (titleLower.includes('dependency') || titleLower.includes('risk')) {
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      }
      return <AlertCircle className="h-5 w-5 text-warning" />;
    }

    if (titleLower.includes('pattern') || titleLower.includes('trend')) {
      return <TrendingUp className="h-5 w-5 text-primary" />;
    }

    return <Sparkles className="h-5 w-5 text-primary" />;
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
    <Card className="mt-8 border-0 dark:border shadow-lg">
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
                    {getInsightIcon(insight.type, insight.title)}
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

            <div className="flex justify-center gap-3 pt-4">
              <Button
                variant="outline"
                onClick={generateInsights}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                Refresh Insights
              </Button>

              <Button
                variant="ghost"
                onClick={generateMoreInsights}
                disabled={isLoading}
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate More
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights;