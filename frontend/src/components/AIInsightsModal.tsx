import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, TrendingUp, AlertCircle, CheckCircle, Lightbulb, RefreshCw, Plus, AlertTriangle } from 'lucide-react';
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
  pageData: Record<string, unknown>;
}

const AIInsightsModal: React.FC<AIInsightsModalProps> = ({ isOpen, onClose, pageType, pageData }) => {
  const { t } = useLanguage();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insightCount, setInsightCount] = useState(3);

  useEffect(() => {
    if (isOpen && pageData) {
      generateInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pageType]);

  const generateInsights = async (count: number = insightCount) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔄 Generating ${count} AI insights for ${pageType}...`);
      const generatedInsights = await aiService.generateInsights(pageData, pageType, count);
      setInsights(generatedInsights);
      setInsightCount(count);
    } catch (error) {
      console.error('Error generating insights:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate insights. Please check your API key configuration.';
      setError(errorMessage);
      setInsights([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMoreInsights = () => {
    const newCount = Math.min(insightCount + 3, 10);
    generateInsights(newCount);
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
          <div className="flex flex-col items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"
            />
            <div className="text-center">
              <p className="text-lg font-medium text-foreground mb-1">Analyzing your data...</p>
              <p className="text-sm text-muted-foreground">AI is generating {insightCount} insights</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Generate Insights</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">{error}</p>
            <Button
              onClick={() => generateInsights()}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-6">
            {/* Header Stats */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AI-Powered Analysis</p>
                  <p className="text-lg font-semibold text-foreground">{insights.length} Insights Generated</p>
                </div>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by Gemini
              </Badge>
            </div>

            {/* AI Generated Insights */}
            <div className="space-y-3">
              <AnimatePresence>
                {insights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-l-4 border-l-primary bg-card hover:shadow-md transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="mt-1">
                              {getInsightIcon(insight.type, insight.title)}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-foreground text-base">
                                  {insight.title}
                                </h4>
                                <Badge className={`text-xs shrink-0 ${getImpactColor(insight.impact)}`}>
                                  {insight.impact}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {insight.description}
                              </p>
                              {insight.metric && (
                                <div className="flex items-center gap-2 pt-1">
                                  <Badge variant="secondary" className="text-xs font-mono">
                                    📊 {insight.metric}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                {t.close}
              </Button>
              <div className="flex gap-2">
                {insightCount < 10 && (
                  <Button
                    onClick={generateMoreInsights}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Generate More
                  </Button>
                )}
                <Button
                  onClick={() => generateInsights()}
                  className="bg-gradient-primary hover:opacity-90"
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mb-6">
              <div className="inline-flex p-4 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full mb-4">
                <Brain className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Get AI-Powered Insights
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Let AI analyze your {pageType} data and provide actionable business insights powered by Google Gemini.
            </p>
            <Button
              onClick={() => generateInsights()}
              disabled={isLoading}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 shadow-lg"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Generate AI Insights
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AIInsightsModal;