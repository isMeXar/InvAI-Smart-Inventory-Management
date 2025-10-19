import React, { useState, useEffect, useRef } from 'react';
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

const AIInsightsModal: React.FC<AIInsightsModalProps> = ({ isOpen, onClose, pageData, pageType }) => {
  const { t, language } = useLanguage();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insightCount, setInsightCount] = useState(3);
  const [prefetchedInsights, setPrefetchedInsights] = useState<Insight[]>([]);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const insightsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && pageData) {
      generateInsights();
    }
    // Reset state when modal closes
    if (!isOpen) {
      setInsights([]);
      setPrefetchedInsights([]);
      setInsightCount(3);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pageType]);

  // Prefetch next 7 insights in background after initial load
  useEffect(() => {
    if (insights.length === 3 && !isPrefetching && !error && isOpen) {
      prefetchMoreInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insights.length, isOpen]);

  const generateInsights = async (count: number = 3) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔄 Generating ${count} AI insights for ${pageType} in ${language}...`);
      const generatedInsights = await aiService.generateInsights(pageData, pageType, count, language);
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

  // Prefetch next 7 insights in the background
  const prefetchMoreInsights = async () => {
    if (isPrefetching || prefetchedInsights.length > 0) return;
    
    setIsPrefetching(true);
    try {
      console.log(`🔮 Prefetching next 7 insights in background (${language})...`);
      const nextInsights = await aiService.generateInsights(pageData, pageType, 10, language);
      // Store insights 4-10 (indices 3-9) for later use
      setPrefetchedInsights(nextInsights.slice(3));
      console.log('✅ Prefetched 7 insights successfully');
    } catch (error) {
      console.error('Error prefetching insights:', error);
    } finally {
      setIsPrefetching(false);
    }
  };

  const generateMoreInsights = () => {
    // Use prefetched insights if available
    if (prefetchedInsights.length > 0) {
      const currentCount = insights.length;
      const insightsToAdd = Math.min(3, 10 - currentCount);
      const newInsights = prefetchedInsights.slice(0, insightsToAdd);
      
      // Append new insights without replacing existing ones
      setInsights(prev => [...prev, ...newInsights]);
      setPrefetchedInsights(prev => prev.slice(insightsToAdd));
      setInsightCount(currentCount + insightsToAdd);
      
      console.log(`✨ Added ${insightsToAdd} insights from prefetch cache`);
      
      // Auto-scroll to show new insights after a brief delay
      setTimeout(() => scrollToBottom(), 100);
    } else {
      // Fallback: fetch new insights if prefetch failed
      fetchAndAppendInsights();
    }
  };

  // Fallback method to fetch and append insights
  const fetchAndAppendInsights = async () => {
    setIsLoading(true);
    try {
      const currentCount = insights.length;
      const totalNeeded = Math.min(currentCount + 3, 10);
      
      console.log(`🔄 Fetching ${totalNeeded} insights (appending ${totalNeeded - currentCount}) in ${language}...`);
      const allInsights = await aiService.generateInsights(pageData, pageType, totalNeeded, language);
      
      // Only append the new ones
      const newInsights = allInsights.slice(currentCount);
      setInsights(prev => [...prev, ...newInsights]);
      setInsightCount(totalNeeded);
      
      // Auto-scroll to show new insights after a brief delay
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error generating more insights:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate more insights.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Smooth scroll to bottom to show new insights
  const scrollToBottom = () => {
    if (insightsContainerRef.current) {
      insightsContainerRef.current.scrollTo({
        top: insightsContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const getInsightIcon = (type: string, impact: string, title?: string) => {
    const titleLower = title?.toLowerCase() || '';
    const iconColor = getIconColor(type, impact);

    if (type === 'positive') {
      if (titleLower.includes('revenue') || titleLower.includes('growth') || titleLower.includes('profit')) {
        return <TrendingUp className={`h-5 w-5 ${iconColor}`} />;
      }
      return <CheckCircle className={`h-5 w-5 ${iconColor}`} />;
    }

    if (type === 'warning') {
      if (titleLower.includes('stock') || titleLower.includes('inventory')) {
        return <AlertCircle className={`h-5 w-5 ${iconColor}`} />;
      }
      if (titleLower.includes('dependency') || titleLower.includes('risk')) {
        return <AlertCircle className={`h-5 w-5 ${iconColor}`} />;
      }
      return <AlertCircle className={`h-5 w-5 ${iconColor}`} />;
    }

    if (titleLower.includes('pattern') || titleLower.includes('trend')) {
      return <TrendingUp className={`h-5 w-5 ${iconColor}`} />;
    }

    return <Sparkles className={`h-5 w-5 ${iconColor}`} />;
  };

  const getIconColor = (type: string, impact: string) => {
    // Low impact is always gray, regardless of type
    if (impact === 'low') {
      return 'text-muted-foreground';
    }

    // Positive insights are green (only if not low impact)
    if (type === 'positive') {
      return 'text-success';
    }

    // For warnings and info, color by impact level
    switch (impact) {
      case 'high':
        return 'text-destructive';
      case 'medium':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const getAccentColor = (type: string, impact: string) => {
    // Low impact is always gray, regardless of type
    if (impact === 'low') {
      return 'border-l-muted-foreground';
    }

    // Positive insights get green accent (only if not low impact)
    if (type === 'positive') {
      return 'border-l-success';
    }

    // For warnings and info, color by impact level
    switch (impact) {
      case 'high':
        return 'border-l-destructive';
      case 'medium':
        return 'border-l-warning';
      default:
        return 'border-l-muted-foreground';
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
              <p className="text-lg font-medium text-foreground mb-1">{t.analyzingYourData}</p>
              <p className="text-sm text-muted-foreground">{t.aiIsGeneratingXInsights.replace('{count}', insightCount.toString())}</p>
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
                  <p className="text-sm text-muted-foreground">{t.aiPoweredAnalysis}</p>
                  <p className="text-lg font-semibold text-foreground">{t.insightsGenerated.replace('{count}', insights.length.toString())}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-sm px-3 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                {t.poweredByGemini}
              </Badge>
            </div>

            {/* AI Generated Insights */}
            <div ref={insightsContainerRef} className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
              <AnimatePresence mode="popLayout">
                {insights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`border-l-4 ${getAccentColor(insight.type, insight.impact)} bg-card hover:shadow-md transition-shadow`}>
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getInsightIcon(insight.type, insight.impact, insight.title)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-foreground text-sm leading-tight">
                                {insight.title}
                              </h4>
                              <Badge className={`text-xs shrink-0 ${getImpactColor(insight.impact)}`}>
                                {insight.impact === 'high' ? t.high : insight.impact === 'medium' ? t.medium : t.low}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {insight.description}
                            </p>
                            {insight.metric && (
                              <div className="flex items-center gap-2 mt-1.5">
                                <Badge variant="secondary" className="text-xs font-mono py-0">
                                  📊 {insight.metric}
                                </Badge>
                              </div>
                            )}
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
                {insights.length < 10 && (
                  <Button
                    onClick={generateMoreInsights}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                    disabled={isLoading || (isPrefetching && prefetchedInsights.length === 0)}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {t.generateMore}
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setInsights([]);
                    setPrefetchedInsights([]);
                    setInsightCount(3);
                    generateInsights(3);
                  }}
                  className="bg-gradient-primary hover:opacity-90"
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t.regenerateInsights}
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
              {t.getAiPoweredInsights}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t.letAiAnalyzeYourData.replace('{pageType}', pageType)}
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