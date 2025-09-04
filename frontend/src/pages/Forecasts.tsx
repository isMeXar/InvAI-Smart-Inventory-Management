import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  BarChart3, 
  DollarSign,
  Package,
  Users,
  ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AIInsights from '@/components/shared/AIInsights';

interface Forecast {
  productId: number;
  month: string;
  predictedDemand: number;
}

interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplierId: number;
}

const Forecasts = () => {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [forecastType, setForecastType] = useState<string>('products');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [forecastsRes, productsRes] = await Promise.all([
        fetch('/data/forecasts.json'),
        fetch('/data/products.json')
      ]);
      const forecastsData = await forecastsRes.json();
      const productsData = await productsRes.json();
      setForecasts(forecastsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProduct = (productId: number) => {
    return products.find(p => p.id === productId);
  };

  const getForecastData = () => {
    switch (forecastType) {
      case 'products':
        return getProductForecastData();
      case 'orders':
        return getOrderForecastData();
      case 'clients':
        return getClientForecastData();
      case 'revenue':
        return getRevenueForecastData();
      default:
        return getProductForecastData();
    }
  };

  const getProductForecastData = () => {
    const monthlyData = forecasts.reduce((acc, forecast) => {
      if (!acc[forecast.month]) {
        acc[forecast.month] = { month: forecast.month, value: 0 };
      }
      acc[forecast.month].value += forecast.predictedDemand;
      return acc;
    }, {} as Record<string, { month: string; value: number }>);

    return Object.values(monthlyData);
  };

  const getOrderForecastData = () => {
    // Simulate order forecasts
    const months = ['Sept', 'Oct'];
    return months.map(month => ({
      month,
      value: Math.floor(Math.random() * 100) + 50
    }));
  };

  const getClientForecastData = () => {
    // Simulate client forecasts
    const months = ['Sept', 'Oct'];
    return months.map(month => ({
      month,
      value: Math.floor(Math.random() * 50) + 20
    }));
  };

  const getRevenueForecastData = () => {
    // Calculate revenue forecasts based on product demand and prices
    const monthlyRevenue = forecasts.reduce((acc, forecast) => {
      const product = getProduct(forecast.productId);
      if (!acc[forecast.month]) {
        acc[forecast.month] = { month: forecast.month, value: 0 };
      }
      if (product) {
        acc[forecast.month].value += forecast.predictedDemand * product.price;
      }
      return acc;
    }, {} as Record<string, { month: string; value: number }>);

    return Object.values(monthlyRevenue);
  };

  const getDetailedForecastData = () => {
    return forecasts.map(forecast => {
      const product = getProduct(forecast.productId);
      const predictedRevenue = product ? forecast.predictedDemand * product.price : 0;
      
      return {
        ...forecast,
        productName: product?.name || 'Unknown Product',
        productCategory: product?.category || 'Unknown',
        currentStock: product?.quantity || 0,
        predictedRevenue
      };
    });
  };

  const getTotalPredictedDemand = () => {
    return forecasts.reduce((total, forecast) => total + forecast.predictedDemand, 0);
  };

  const getTotalPredictedRevenue = () => {
    return forecasts.reduce((total, forecast) => {
      const product = getProduct(forecast.productId);
      return total + (product ? forecast.predictedDemand * product.price : 0);
    }, 0);
  };

  const getGrowthPercentage = () => {
    const septData = forecasts.filter(f => f.month === 'Sept');
    const octData = forecasts.filter(f => f.month === 'Oct');
    
    const septTotal = septData.reduce((sum, f) => sum + f.predictedDemand, 0);
    const octTotal = octData.reduce((sum, f) => sum + f.predictedDemand, 0);
    
    if (septTotal === 0) return 0;
    return ((octTotal - septTotal) / septTotal * 100).toFixed(1);
  };

  const getForecastTypeIcon = (type: string) => {
    switch (type) {
      case 'products':
        return <Package className="h-4 w-4" />;
      case 'orders':
        return <ShoppingCart className="h-4 w-4" />;
      case 'clients':
        return <Users className="h-4 w-4" />;
      case 'revenue':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const canViewForecasts = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!canViewForecasts) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">{t.accessDenied}</h2>
            <p className="text-muted-foreground">
              {t.onlyManagersAndAdminsCanAccessForecasting}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.demandForecasting}</h1>
          <p className="text-muted-foreground mt-1">
            {t.aiPoweredPredictions}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{t.forecastPeriod}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.predictedDemand}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalPredictedDemand().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t.unitsNextMonths}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.predictedRevenue}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalPredictedRevenue().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t.expectedRevenue}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.growthRate}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">+{getGrowthPercentage()}%</div>
            <p className="text-xs text-muted-foreground">
              {t.monthOverMonth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.productsTracked}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(forecasts.map(f => f.productId)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              {t.activeForecasts}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>{t.forecastAnalysis}</CardTitle>
            <Select value={forecastType} onValueChange={setForecastType}>
              <SelectTrigger className="w-48">
                {getForecastTypeIcon(forecastType)}
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="products">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    {t.products}
                  </div>
                </SelectItem>
                <SelectItem value="orders">
                  <div className="flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {t.orders}
                  </div>
                </SelectItem>
                <SelectItem value="clients">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {t.clients}
                  </div>
                </SelectItem>
                <SelectItem value="revenue">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {t.revenue}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {forecastType === 'revenue' ? (
              <BarChart data={getForecastData()}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, t.revenue]} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={getForecastData()}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [value, t[forecastType]]} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Forecasts Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t.detailedForecasts}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.product}</TableHead>
                <TableHead>{t.category}</TableHead>
                <TableHead>{t.month}</TableHead>
                <TableHead>{t.currentStock}</TableHead>
                <TableHead>{t.predictedDemand}</TableHead>
                <TableHead>{t.predictedRevenue}</TableHead>
                <TableHead>{t.stockStatus}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getDetailedForecastData().map((forecast, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{forecast.productName}</div>
                      <div className="text-sm text-muted-foreground">{t.id}: {forecast.productId}</div>
                    </div>
                  </TableCell>
                  <TableCell>{forecast.productCategory}</TableCell>
                  <TableCell>{forecast.month}</TableCell>
                  <TableCell>{forecast.currentStock}</TableCell>
                  <TableCell>{forecast.predictedDemand}</TableCell>
                  <TableCell>${forecast.predictedRevenue.toLocaleString()}</TableCell>
                  <TableCell>
                    {forecast.currentStock >= forecast.predictedDemand ? (
                      <span className="text-success font-medium">{t.sufficient}</span>
                    ) : (
                      <span className="text-destructive font-medium">
                        {t.needMore.replace('{count}', (forecast.predictedDemand - forecast.currentStock).toString())}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <AIInsights data={forecasts} pageType="forecasts" />
    </motion.div>
  );
};

export default Forecasts;