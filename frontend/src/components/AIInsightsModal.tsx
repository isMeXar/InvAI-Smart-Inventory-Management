import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, TrendingUp, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';
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

interface AIInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageType: 'dashboard' | 'products' | 'orders' | 'forecasts' | 'users' | 'suppliers' | 'profile';
  pageData: any;
}

const AIInsightsModal: React.FC<AIInsightsModalProps> = ({ isOpen, onClose, pageType, pageData }) => {
  const { t } = useLanguage();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && pageData) {
      generateInsights();
    }
  }, [isOpen, pageType, pageData]);

  const generateInsights = async () => {
    setIsLoading(true);

    try {
      console.log(`🔄 Generating AI insights for ${pageType}...`);
      const generatedInsights = await aiService.generateInsights(pageData, pageType);
      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights([]);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Brain className="h-6 w-6 text-primary" />
            <span>{t.aiInsights} - {pageType.charAt(0).toUpperCase() + pageType.slice(1)}</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
            />
            <span className="ml-3 text-muted-foreground">{t.analyzingData}...</span>
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-6">
            {/* AI Generated Insights */}
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-primary/20 bg-card">
                    <CardContent className="p-4">
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
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" onClick={onClose}>
                {t.close}
              </Button>
              <Button onClick={generateInsights} className="bg-gradient-primary hover:opacity-90">
                <Sparkles className="h-4 w-4 mr-2" />
                {t.regenerateInsights}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No insights available. Click generate to create AI insights.
            </p>
            <Button
              onClick={generateInsights}
              disabled={isLoading}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate AI Insights
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AIInsightsModal;