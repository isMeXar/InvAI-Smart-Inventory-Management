import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Brain, TrendingUp, Package, AlertTriangle, Lightbulb } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AIInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'dashboard' | 'products' | 'orders' | 'forecasts';
}

const AIInsightsModal: React.FC<AIInsightsModalProps> = ({ isOpen, onClose, type }) => {
  const { t } = useLanguage();
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateInsights();
    }
  }, [isOpen, type]);

  const generateInsights = async () => {
    setIsLoading(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const mockInsights = getInsightsByType(type);
      setInsights(mockInsights);
      setIsLoading(false);
    }, 1500);
  };

  const getInsightsByType = (insightType: string) => {
    const commonInsights = {
      dashboard: {
          title: t.smartInventoryAIInsights,
          summary: t.basedOnInventoryData,
          recommendations: [
            t.laptopProLow,
            t.electronicsGrowth,
            t.officeSuppliesOptimal,
            t.considerBundleDeals
          ],
        chartData: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Inventory Turnover',
            data: [65, 59, 80, 81, 56, 75],
            backgroundColor: 'hsl(217 91% 60% / 0.8)',
            borderColor: 'hsl(217 91% 60%)',
            borderWidth: 2
          }]
        },
        chartType: 'bar'
      },
      products: {
        title: t.productPerformanceAnalysis,
        summary: t.aiAnalysisProducts,
        recommendations: [
          t.topPerformerHeadphones,
          t.slowMoverDesk,
          t.reorderAlertSmartphone,
          t.priceOptimizationMonitor
        ],
        chartData: {
          labels: ['Electronics', 'Furniture', 'Office Supplies'],
          datasets: [{
            data: [45, 35, 20],
            backgroundColor: [
              'hsl(217 91% 60%)',
              'hsl(213 94% 68%)',
              'hsl(215 28% 70%)'
            ]
          }]
        },
        chartType: 'doughnut'
      },
      orders: {
        title: t.orderPatternIntelligence,
        summary: t.machineLearningAnalysis,
        recommendations: [
          t.peakOrderingTime,
          t.bulkOrderOpportunity,
          t.seasonalTrendElectronics,
          t.crossSellPotential
        ],
        chartData: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          datasets: [{
            label: 'Order Volume',
            data: [12, 19, 8, 15, 10],
            borderColor: 'hsl(217 91% 60%)',
            backgroundColor: 'hsl(217 91% 60% / 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        chartType: 'line'
      },
      forecasts: {
        title: t.demandForecastingInsights,
        summary: t.predictiveAnalytics,
        recommendations: [
          t.projectedSmartphoneIncrease,
          t.seasonalDeclineOfficeSupplies,
          t.recommendedSafetyStock,
          t.considerPreordering
        ],
        chartData: {
          labels: ['Sept', 'Oct', 'Nov', 'Dec'],
          datasets: [{
            label: 'Predicted Demand',
            data: [85, 95, 120, 140],
            backgroundColor: 'hsl(142 76% 46% / 0.8)',
            borderColor: 'hsl(142 76% 46%)',
            borderWidth: 2
          }, {
            label: 'Actual Demand',
            data: [80, 90, 115, null],
            backgroundColor: 'hsl(217 91% 60% / 0.8)',
            borderColor: 'hsl(217 91% 60%)',
            borderWidth: 2
          }]
        },
        chartType: 'bar'
      }
    };

    return commonInsights[insightType] || commonInsights.dashboard;
  };

  const renderChart = () => {
    if (!insights) return null;

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        tooltip: {
          backgroundColor: 'hsl(var(--popover))',
          borderColor: 'hsl(var(--border))',
          titleColor: 'hsl(var(--popover-foreground))',
          bodyColor: 'hsl(var(--popover-foreground))',
        }
      },
      scales: insights.chartType !== 'doughnut' ? {
        y: {
          beginAtZero: true,
          // grid: {
          //   color: 'hsl(var(--border))'
          // },
          ticks: {
            color: 'hsl(var(--muted-foreground))'
          }
        },
        x: {
          // grid: {
          //   color: 'hsl(var(--border))'
          // },
          ticks: {
            color: 'hsl(var(--muted-foreground))'
          }
        }
      } : undefined
    };

    switch (insights.chartType) {
      case 'bar':
        return <Bar data={insights.chartData} options={options} />;
      case 'line':
        return <Line data={insights.chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={insights.chartData} options={options} />;
      default:
        return <Bar data={insights.chartData} options={options} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-xl">
            <Brain className="h-6 w-6 text-primary" />
            <span>{insights?.title || t.aiInsights}</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
            />
            <span className="ml-3 text-muted-foreground">{t.analyzingData}</span>
          </div>
        ) : insights ? (
          <div className="space-y-6">
            {/* Summary */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <p className="text-foreground">{insights.summary}</p>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>{t.dataVisualization}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {renderChart()}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-warning" />
                  <span>{t.aiRecommendations}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.recommendations.map((rec: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">{index + 1}</span>
                      </div>
                      <p className="text-sm text-foreground">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <Button variant="outline" onClick={onClose}>
                {t.close}
              </Button>
              <Button onClick={generateInsights} className="bg-gradient-primary hover:opacity-90">
                {t.regenerateInsights}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default AIInsightsModal;