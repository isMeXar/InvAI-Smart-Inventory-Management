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
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AIInsightsModal from '@/components/AIInsightsModal';
import { productsAPI, ordersAPI, usersAPI, suppliersAPI } from '@/lib/api';

interface DashboardData {
  products: unknown[];
  orders: unknown[];
  users: unknown[];
  suppliers: unknown[];
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
  const [ordersPage, setOrdersPage] = useState(1);
  const [alertsPage, setAlertsPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      // Simulate real-time data updates
      setData(prevData => ({
        ...prevData,
        orders: (prevData.orders as Record<string, unknown>[]).map((order: Record<string, unknown>) => ({
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
      change: '+8 from last month',
      changeType: 'positive'
    },
    {
      title: t.pendingOrders,
      value: (data.orders as Record<string, unknown>[]).filter((o: Record<string, unknown>) => o.status !== 'Delivered').length,
      icon: ShoppingCart,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      change: '+12 from last month',
      changeType: 'positive'
    },
    {
      title: t.totalUsers,
      value: data.users.length,
      icon: Users,
      color: 'text-success',
      bgColor: 'bg-success/10',
      change: '+3 from last month',
      changeType: 'positive'
    },
    {
      title: t.totalSuppliers,
      value: data.suppliers.length,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+2 from last month',
      changeType: 'positive'
    }
  ];

  // Pagination for Recent Orders
  const totalOrdersPages = Math.ceil(data.orders.length / itemsPerPage);
  const startOrderIndex = (ordersPage - 1) * itemsPerPage;
  const endOrderIndex = startOrderIndex + itemsPerPage;
  const paginatedOrders = data.orders.slice(startOrderIndex, endOrderIndex);

  // Pagination for Low Stock Alerts
  const allAlerts = [
    ...(data.products as Record<string, unknown>[]).filter((p: Record<string, unknown>) => (p.quantity as number) <= 20),
    ...(data.products as Record<string, unknown>[]).filter((p: Record<string, unknown>) => (p.quantity as number) > 20 && (p.quantity as number) <= 50)
  ];
  const totalAlertsPages = Math.ceil(allAlerts.length / itemsPerPage);
  const startAlertIndex = (alertsPage - 1) * itemsPerPage;
  const endAlertIndex = startAlertIndex + itemsPerPage;
  const paginatedAlerts = allAlerts.slice(startAlertIndex, endAlertIndex);

  const lowStockProducts = (data.products as Record<string, unknown>[]).filter((p: Record<string, unknown>) => (p.quantity as number) <= 20);
  const warningStockProducts = (data.products as Record<string, unknown>[]).filter((p: Record<string, unknown>) => (p.quantity as number) > 20 && (p.quantity as number) <= 50);


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
            <Card className="bg-card/95 backdrop-blur-sm border-0 shadow-lg dark:shadow-none dark:border dark:border-border/40 hover:shadow-xl dark:hover:shadow-none transition-all duration-300">
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
                      {stat.change}
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
          <Card className="h-[550px] flex flex-col bg-card/95 backdrop-blur-sm border-0 shadow-lg dark:shadow-none dark:border dark:border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <span>{t.recentOrders}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1 overflow-y-auto">
                {paginatedOrders.map((order, index) => {
                  const orderData = order as Record<string, unknown>;
                  return (
                    <motion.div
                      key={orderData.id as number}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(orderData.status as string)}
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {String((orderData.product as Record<string, unknown>)?.name || orderData.product_name || 'Product Not Found')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ordered by {String(orderData.user_name || (orderData.user as Record<string, unknown>)?.name || (orderData.user as Record<string, unknown>)?.username || 'Employee Not Found')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          Qty: {orderData.quantity as number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {orderData.status as string}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination for Recent Orders */}
              {totalOrdersPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-4 pt-4 border-t border-border/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOrdersPage(prev => Math.max(prev - 1, 1))}
                    disabled={ordersPage === 1}
                    className="p-2 h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {[...Array(totalOrdersPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={ordersPage === i + 1 ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setOrdersPage(i + 1)}
                      className="h-8 w-8 p-0 text-xs"
                    >
                      {i + 1}
                    </Button>
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOrdersPage(prev => Math.min(prev + 1, totalOrdersPages))}
                    disabled={ordersPage === totalOrdersPages}
                    className="p-2 h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Low Stock Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-[550px] flex flex-col bg-card/95 backdrop-blur-sm border-0 shadow-lg dark:shadow-none dark:border dark:border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span>{t.lowStockAlerts}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-4 flex-1 overflow-y-auto">
                {paginatedAlerts.length > 0 ? (
                  paginatedAlerts.map((product, index) => {
                    const productData = product as Record<string, unknown>;
                    const isLowStock = (productData.quantity as number) <= 20;
                    return (
                      <motion.div
                        key={productData.id as number}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={`flex items-center justify-between p-3 border rounded-lg ${
                          isLowStock
                            ? 'bg-destructive/5 border-destructive/20'
                            : 'bg-warning/5 border-warning/20'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {productData.name as string}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {productData.category as string}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${
                            isLowStock ? 'text-destructive' : 'text-warning'
                          }`}>
                            {productData.quantity as number} {t.left}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t.reorderNeeded}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {t.allProductsStocked}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination for Low Stock Alerts */}
              {totalAlertsPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-4 pt-4 border-t border-border/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAlertsPage(prev => Math.max(prev - 1, 1))}
                    disabled={alertsPage === 1}
                    className="p-2 h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {[...Array(totalAlertsPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={alertsPage === i + 1 ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setAlertsPage(i + 1)}
                      className="h-8 w-8 p-0 text-xs"
                    >
                      {i + 1}
                    </Button>
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAlertsPage(prev => Math.min(prev + 1, totalAlertsPages))}
                    disabled={alertsPage === totalAlertsPages}
                    className="p-2 h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Insights Modal */}
      <AIInsightsModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        pageType="dashboard"
        pageData={{
          totalCounts: {
            products: data.products.length,
            orders: data.orders.length,
            users: data.users.length,
            suppliers: data.suppliers.length
          },
          lowStockProductsCount: (data.products as Record<string, unknown>[]).filter((p: Record<string, unknown>) => (p.quantity as number) < 50).length,
          recentOrders: data.orders.slice(0, 5),
          products: data.products,
          orders: data.orders,
          users: data.users,
          suppliers: data.suppliers
        }}
      />
    </div>
  );
};

export default Dashboard;