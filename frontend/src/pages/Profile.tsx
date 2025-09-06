import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Shield,
  Edit,
  Camera,
  ShoppingCart,
  Package,
  TrendingUp,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AIInsights from '@/components/shared/AIInsights';

interface Order {
  id: number;
  productId: number;
  userId: number;
  quantity: number;
  status: 'Shipped' | 'Processing' | 'Delivered' | 'Pending';
  date: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplierId: number;
}

type ChartView = "daily" | "monthly" | "yearly";

const Profile = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [chartView, setChartView] = useState<"daily" | "monthly" | "yearly">("monthly");


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/data/orders.json'),
        fetch('/data/products.json')
      ]);
      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();
      setOrders(ordersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserOrders = () => {
    return orders.filter(order => order.userId === user?.id);
  };

  const getProduct = (productId: number) => {
    return products.find(p => p.id === productId);
  };

  const getOrderValue = (order: Order) => {
    const product = getProduct(order.productId);
    return product ? product.price * order.quantity : 0;
  };

  const getTotalSpent = () => {
    return getUserOrders().reduce((total, order) => total + getOrderValue(order), 0);
  };

  const getOrdersByCategory = () => {
    const userOrders = getUserOrders();
    const categoryData = userOrders.reduce((acc, order) => {
      const product = getProduct(order.productId);
      if (product) {
        acc[product.category] = (acc[product.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryData).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / userOrders.length) * 100)
    }));
  };

  // const getOrderHistory = () => {
  //   // Simulate monthly order data
  //   const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  //   return months.map(month => ({
  //     month,
  //     orders: Math.floor(Math.random() * 5) + 1,
  //     spent: Math.floor(Math.random() * 5000) + 1000
  //   }));
  // };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-destructive text-destructive-foreground';
      case 'Manager':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-success text-success-foreground';
      case 'Shipped':
        return 'bg-primary text-primary-foreground';
      case 'Processing':
        return 'bg-warning text-warning-foreground';
      case 'Pending':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getOrderHistory = useMemo(() => {
    const userOrders = getUserOrders();
    const grouped: Record<string, { orders: number; spent: number }> = {};

    userOrders.forEach(order => {
      const product = getProduct(order.productId);
      if (!product || !order.date) return;

      const date = new Date(order.date);
      let key = "";

      if (chartView === "daily") {
        key = date.toISOString().split("T")[0]; // YYYY-MM-DD
      } else if (chartView === "monthly") {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`; // YYYY-M
      } else if (chartView === "yearly") {
        key = `${date.getFullYear()}`;
      }

      if (!grouped[key]) {
        grouped[key] = { orders: 0, spent: 0 };
      }
      grouped[key].orders += 1;
      grouped[key].spent += product.price * order.quantity;
    });

    return Object.entries(grouped).map(([period, values]) => ({
      period,
      ...values
    }));
  }, [orders, products, chartView, user]);


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">{t.noUserData}</h2>
            <p className="text-muted-foreground">
              {t.unableToLoadProfile}
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
          <h1 className="text-3xl font-bold text-foreground">{t.profile}</h1>
          <p className="text-muted-foreground mt-1">
            {t.manageAccount}
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          className={!isEditing ? "bg-gradient-primary hover:opacity-90" : ""}
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? t.cancel : t.editProfile}
        </Button>
      </div>

      {/* Profile Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.personalInformation}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-border"
                />
                {isEditing && (
                  <button className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary-hover transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                  <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                </div>
                <p className="text-muted-foreground">ID: {user.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.fullName}</Label>
                <Input
                  id="name"
                  value={user.name}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">{t.role}</Label>
                <Input
                  id="role"
                  value={user.role}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.emailAddress}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={user.email}
                    disabled={!isEditing}
                    className={`pl-10 ${!isEditing ? "bg-muted" : ""}`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t.phoneNumber}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={user.phone}
                    disabled={!isEditing}
                    className={`pl-10 ${!isEditing ? "bg-muted" : ""}`}
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  {t.cancel}
                </Button>
                <Button className="bg-gradient-primary hover:opacity-90">
                  {t.save}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t.activitySummary}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t.totalOrders}</span>
              </div>
              <span className="text-lg font-bold">{getUserOrders().length}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t.totalGenerated}</span>
              </div>
              <span className="text-lg font-bold">${getTotalSpent().toLocaleString()}</span>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">{t.favoriteCategories}</h4>
              {getOrdersByCategory().slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.category}</span>
                  <span className="font-medium">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order History Chart */}
      {/* Order History Chart */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle>{t.orderHistory}</CardTitle>
          <div className="flex space-x-2 mt-2 md:mt-0">
            <Button
              variant={chartView === "daily" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartView("daily")}
            >
              {t.daily}
            </Button>
            <Button
              variant={chartView === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartView("monthly")}
            >
              {t.monthly}
            </Button>
            <Button
              variant={chartView === "yearly" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartView("yearly")}
            >
              {t.yearly}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getOrderHistory}>
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                name={t.orders}
              />
              <Line
                type="monotone"
                dataKey="spent"
                stroke="hsl(var(--secondary))"
                strokeWidth={3}
                name={t.spent}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>


      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>{t.recentOrders}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>{t.product}</TableHead>
                <TableHead>{t.quantity}</TableHead>
                <TableHead>{t.status}</TableHead>
                <TableHead>{t.total}</TableHead>
                <TableHead>{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getUserOrders().slice(0, 5).map((order) => {
                const product = getProduct(order.productId);
                return (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">
                          {product?.name || t.unknownProduct}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {product?.category}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>${getOrderValue(order).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsViewModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {getUserOrders().length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.noOrdersForUser}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <AIInsights data={getUserOrders()} pageType="profile" />

      {/* View Order Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.orders} {t.details}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t.orderID}</Label>
                  <p className="text-foreground font-medium">#{selectedOrder.id}</p>
                </div>
                <div>
                  <Label>{t.status}</Label><br />
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <Label>{t.product}</Label>
                  <p className="text-foreground font-medium">
                    {getProduct(selectedOrder.productId)?.name || 'Unknown Product'}
                  </p>
                </div>
                <div>
                  <Label>{t.category}</Label>
                  <p className="text-foreground font-medium">
                    {getProduct(selectedOrder.productId)?.category || 'Unknown'}
                  </p>
                </div>
                <div>
                  <Label>{t.quantity}</Label>
                  <p className="text-foreground font-medium">{selectedOrder.quantity}</p>
                </div>
                <div>
                  <Label>{t.totalValue}</Label>
                  <p className="text-foreground font-medium">${getOrderValue(selectedOrder).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Profile;