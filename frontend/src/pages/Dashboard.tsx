import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Brain, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AIInsightsModal from '@/components/AIInsightsModal';
import { productsAPI, ordersAPI, usersAPI, suppliersAPI } from '@/lib/api';

interface DashboardData {
  products: any[];
  orders: any[];
  users: any[];
  suppliers: any[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState<DashboardData>({
    products: [],
    orders: [],
    users: [],
    suppliers: []
  });
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      // Simulate real-time data updates
      setData(prevData => ({
        ...prevData,
        orders: prevData.orders.map(order => ({
          ...order,
          // Randomly update some order statuses
          status: Math.random() > 0.95 ? getRandomStatus() : order.status
        }))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [products, orders, users, suppliers] = await Promise.all([
        productsAPI.getAll(),
        ordersAPI.getAll(),
        usersAPI.getAll(),
        suppliersAPI.getAll()
      ]);

      setData({
        products: products.results || products,
        orders: orders.results || orders,
        users: users.results || users,
        suppliers: suppliers.results || suppliers
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomStatus = () => {
    const statuses = ['Processing', 'Shipped', 'Delivered', 'Pending'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const stats = [
    {
      title: t.totalProducts,
      value: data.products.length,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: t.pendingOrders,
      value: data.orders.filter(o => o.status !== 'Delivered').length,
      icon: ShoppingCart,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: t.totalUsers,
      value: data.users.length,
      icon: Users,
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: t.totalSuppliers,
      value: data.suppliers.length,
      icon: TrendingUp,
      color: 'text-info',
      bgColor: 'bg-info/10',
      change: '+5%',
      changeType: 'positive'
    }
  ];

  const recentOrders = data.orders.slice(0, 5);
  const lowStockProducts = data.products.filter(p => p.quantity <= 20);
  const warningStockProducts = data.products.filter(p => p.quantity > 20 && p.quantity <= 50);


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'Shipped':
        return <TrendingUp className="h-4 w-4 text-primary" />;
      case 'Processing':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
        <span className="ml-3 text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t.welcomeBackUser.replace('{name}', user?.name || '')} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {t.inventoryToday}
          </p>
        </div>
        
        <Button
          onClick={() => setIsAIModalOpen(true)}
          className="mt-4 sm:mt-0 bg-gradient-primary hover:opacity-90 transition-opacity"
        >
          <Brain className="mr-2 h-4 w-4" />
          {t.aiInsights}
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300 border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className={`text-xs ${
                      stat.changeType === 'positive' ? 'text-success' : 'text-destructive'
                    }`}>
                      {stat.change} {t.fromLastMonth}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <span>{t.recentOrders}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order, index) => {
                  const product = data.products.find(p => p.id === order.productId);
                  const user = data.users.find(u => u.id === order.userId);
                  
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {product?.name || 'Unknown Product'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t.orderedBy.replace('{name}', user?.name || t.unknownUser)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {t.qty}: {order.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t[order.status.toLowerCase()]}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span>{t.lowStockAlerts}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-3 bg-destructive/5 border border-destructive/20 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-destructive">
                          {product.quantity} {t.left}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.reorderNeeded}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {t.allProductsStocked}
                    </p>
                  </div>
                )}

                {warningStockProducts.length > 0 ? (
                  warningStockProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-warning">
                          {product.quantity} {t.left}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.reorderNeeded}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {t.allProductsStocked}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Insights Modal */}
      <AIInsightsModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        type="dashboard"
      />
    </div>
  );
};

export default Dashboard;