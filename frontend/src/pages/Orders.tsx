import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Search,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  Filter,
  CheckCircle,
  Clock,
  Package,
  Eye,
  Copy,
  CopyCheck,
  ClipboardList,
  Calendar,
  Package2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
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
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AIInsights from '@/components/shared/AIInsights';

interface Order {
  id: number;
  productId: number;
  userId: number;
  quantity: number;
  status: 'Shipped' | 'Processing' | 'Delivered' | 'Pending';
}

interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplierId: number;
}

interface User {
  id: number;
  name: string;
  role: 'Admin' | 'Manager' | 'Employee';
  email: string;
  phone: string;
  profilePic: string;
}

const Orders = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrder, setNewOrder] = useState({
    productId: '',
    userId: '',
    quantity: '',
    status: 'Pending'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        fetch('/data/orders.json'),
        fetch('/data/products.json'),
        fetch('/data/users.json')
      ]);
      const ordersData = await ordersRes.json();
      const productsData = await productsRes.json();
      const usersData = await usersRes.json();
      setOrders(ordersData);
      setProducts(productsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProduct = (productId: number) => {
    return products.find(p => p.id === productId);
  };

  const getUser = (userId: number) => {
    return users.find(u => u.id === userId);
  };

  const getOrderValue = (order: Order) => {
    const product = getProduct(order.productId);
    return product ? product.price * order.quantity : 0;
  };

  const filteredOrders = orders.filter(order => {
    const product = getProduct(order.productId);
    const user = getUser(order.userId);
    const matchesSearch = product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'Shipped':
        return <Package className="h-4 w-4" />;
      case 'Processing':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getOrdersByStatusData = () => {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      fill: status === 'Delivered' ? 'hsl(var(--success))' :
        status === 'Shipped' ? 'hsl(var(--primary))' :
          status === 'Processing' ? 'hsl(var(--warning))' :
            'hsl(var(--muted))'
    }));
  };

  const getOrdersByProductData = () => {
    const productOrders = products.map(product => {
      const orderCount = orders.filter(order => order.productId === product.id).length;
      return {
        name: product.name.length > 10 ? product.name.substring(0, 10) + '...' : product.name,
        orders: orderCount,
        fill: 'hsl(var(--primary))'
      };
    }).filter(item => item.orders > 0);

    return productOrders;
  };

  const getMonthlyRevenueData = () => {
    // Simulate monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    return months.map((month, index) => ({
      month,
      orders: Math.floor(Math.random() * 20) + 10,
      revenue: Math.floor(Math.random() * 50000) + 30000,
    }));
  };

  const getTotalRevenue = () => {
    return orders.reduce((total, order) => total + getOrderValue(order), 0);
  };

  const canEditOrders = user?.role === 'Admin' || user?.role === 'Manager';
  const canViewRevenue = user?.role === 'Admin' || user?.role === 'Manager';

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
          <h1 className="text-3xl font-bold text-foreground">{t.orderManagement}</h1>
          <p className="text-muted-foreground mt-1">
            {t.trackCustomerOrders}
          </p>
        </div>
        {canEditOrders && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                {t.newOrder}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Order</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="product">Product</Label>
                  <Select value={newOrder.productId} onValueChange={(value) => setNewOrder({ ...newOrder, productId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={newOrder.userId} onValueChange={(value) => setNewOrder({ ...newOrder, userId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newOrder.status} onValueChange={(value) => setNewOrder({ ...newOrder, status: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  console.log('Adding order:', newOrder);
                  setIsAddModalOpen(false);
                  setNewOrder({
                    productId: '',
                    userId: '',
                    quantity: '',
                    status: 'Pending'
                  });
                }}>Add Order</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="border-0 dark:border shadow-lg flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalOrders}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              {t.allTimeOrders}
            </p>
          </CardContent>
        </Card>

        {canViewRevenue && (
          <Card className="border-0 dark:border shadow-lg flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.revenue}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${getTotalRevenue().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {t.fromAllOrders}
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 dark:border shadow-lg flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.pendingOrders}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t.needAttention}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 dark:border shadow-lg flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.completed}</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'Delivered').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t.successfullyDelivered}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Orders By Status */}
        <Card className="border-0 dark:border shadow-lg flex-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <span>{t.ordersByStatus}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={getOrdersByStatusData()}
                margin={{ top: 20, right: 0, bottom: 80, left: 0 }} // extra space
              >
                <CartesianGrid strokeDasharray="5 5" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="status"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: t.status, position: 'insideBottom', offset: -70, fill: 'hsl(var(--foreground))' }}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: t.orders, angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2 rounded-md border bg-[hsl(var(--card))] shadow-md">
                          <p className="font-medium text-foreground">{label}</p>
                          <p className="text-sm text-muted-foreground">{t.orders}: {payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders By Product */}
        {canViewRevenue && (
          <Card className="border-0 dark:border shadow-lg flex-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package2 className="h-5 w-5 text-primary" />
                <span>{t.ordersPerProduct}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={getOrdersByProductData()}
                  margin={{ top: 20, right: 0, bottom: 80, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="5 5" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: t.products, position: 'insideBottom', offset: -70, fill: 'hsl(var(--foreground))' }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: t.orders, angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="p-2 rounded-md border bg-[hsl(var(--card))] shadow-md">
                            <p className="font-medium text-foreground">{label}</p>
                            <p className="text-sm text-muted-foreground">{t.orders}: {payload[0].value}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Monthly Orders & Revenue */}
      <Card className="border-0 dark:border shadow-lg flex-1 mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>{t.monthlyOrdersRevenue}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={getMonthlyRevenueData()}
              margin={{ top: 20, right: 30, bottom: 50, left: 0 }} // extra space for x & y labels
            >
              <CartesianGrid strokeDasharray="5 5" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: t.month, position: 'insideBottom', offset: -30, fill: 'hsl(var(--foreground))' }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: t.orders, angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: t.revenue + ' ($)', angle: 90, position: 'insideRight', offset: -20, fill: 'hsl(var(--foreground))' }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-2 rounded-md border bg-[hsl(var(--card))] shadow-md">
                        <p className="font-medium text-foreground">{label}</p>
                        {payload.map(p => (
                          <p key={p.dataKey} className="text-sm text-muted-foreground">
                            {p.name}: {p.value.toLocaleString()}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="orders"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                name={t.ordersLineName}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--accent))"
                strokeWidth={3}
                name={t.revenueLineName}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>



      {/* Orders Table */}
      <Card className="border-0 dark:border shadow-lg">
        <CardHeader>
          <CardTitle>{t.orderHistory}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.searchOrders}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t.filterByStatus} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allStatus}</SelectItem>
                <SelectItem value="Pending">{t.pending}</SelectItem>
                <SelectItem value="Processing">{t.processing}</SelectItem>
                <SelectItem value="Shipped">{t.shipped}</SelectItem>
                <SelectItem value="Delivered">{t.delivered}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.orderID}</TableHead>
                <TableHead>{t.product}</TableHead>
                <TableHead className='hidden lg:table-cell'>{t.customer}</TableHead>
                <TableHead className='hidden md:table-cell'>{t.quantity}</TableHead>
                <TableHead>{t.status}</TableHead>
                {canViewRevenue && <TableHead className='hidden md:table-cell'>{t.total}</TableHead>}
                {canEditOrders && <TableHead className="text-right">{t.actions}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const product = getProduct(order.productId);
                const user = getUser(order.userId);
                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">#{order.id}</div>
                    </TableCell>
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
                    <TableCell className='hidden lg:table-cell'>
                      <div>
                        <div className="font-medium text-foreground">
                          {user?.name || t.unknownUser}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='hidden md:table-cell'>{order.quantity}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </TableCell>
                    {canViewRevenue && (
                      <TableCell className='hidden md:table-cell'>
                        <div className="font-medium">
                          ${getOrderValue(order).toLocaleString()}
                        </div>
                      </TableCell>
                    )}
                    {canEditOrders && (
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setNewOrder({
                                productId: order.productId.toString(),
                                userId: order.userId.toString(),
                                quantity: order.quantity.toString(),
                                status: order.status
                              });
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.orderNotFound}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <AIInsights data={orders} pageType="orders" />

      {/* View Order Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* General Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Order ID</Label>
                  <p className="text-foreground font-medium">#{selectedOrder.id}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge
                    className={`${getStatusColor(
                      selectedOrder.status
                    )} flex items-center gap-1 w-fit mt-1`}
                  >
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <Label>Product</Label>
                  <p className="text-foreground font-medium">
                    {getProduct(selectedOrder.productId)?.name || "Unknown Product"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getProduct(selectedOrder.productId)?.category || "Unavailable"}
                  </p>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <p className="text-foreground font-medium">
                    {selectedOrder.quantity}
                  </p>
                </div>
                <div>
                  <Label>Total Value</Label>
                  <p className="text-foreground font-medium">
                    ${getOrderValue(selectedOrder).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Employee Info */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold">Employee Info</h3>
                  <div className="relative group">
                    <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 bg-muted text-muted-foreground cursor-pointer">
                      <span className="text-xs font-bold">!</span>
                    </div>
                    {/* Tooltip */}
                    <div className="absolute right-0 top-full mt-1 w-64 p-2 rounded-md bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      This is the user who entered this order into the system.
                    </div>
                  </div>
                </div>

                {(() => {
                  const employee = getUser(selectedOrder.userId);
                  return (
                    <div className="space-y-4">
                      {/* Top row: Avatar + Name + Role */}
                      <div className="flex items-center gap-4">
                        <img
                          src={employee?.profilePic || "/placeholder-user.png"}
                          alt={employee?.name || "Employee"}
                          className="w-14 h-14 rounded-full object-cover border"
                        />
                        <div>
                          <p className="text-foreground font-medium">
                            {employee?.name || "Unavailable"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {employee?.role || "Unavailable"}
                          </p>
                        </div>
                      </div>

                      {/* Contact Info: Email + Phone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email */}
                        <div className="w-full bg-muted px-3 py-2 rounded-lg flex items-center justify-between">
                          <div className="flex flex-col">
                            <Label className="text-sm">Email Contact</Label>
                            <span className="text-sm text-foreground truncate">
                              {employee?.email || "Unavailable"}
                            </span>
                          </div>
                          {employee?.email && (
                            <button
                              onClick={() => handleCopy(employee.email, "email")}
                              className="ml-4 text-muted-foreground hover:text-foreground flex-shrink-0"
                            >
                              {copiedField === "email" ? (
                                <CopyCheck className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Phone */}
                        <div className="w-full bg-muted px-3 py-2 rounded-lg flex items-center justify-between">
                          <div className="flex flex-col">
                            <Label className="text-sm">Phone Contact</Label>
                            <span className="text-sm text-foreground truncate">
                              {employee?.phone || "Unavailable"}
                            </span>
                          </div>
                          {employee?.phone && (
                            <button
                              onClick={() => handleCopy(employee.phone, "phone")}
                              className="ml-4 text-muted-foreground hover:text-foreground flex-shrink-0"
                            >
                              {copiedField === "phone" ? (
                                <CopyCheck className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>


                    </div>
                  );
                })()}
              </div>


            </div>
          )}
        </DialogContent>
      </Dialog>


      {/* Update Order Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Product */}
            <div>
              <Label htmlFor="edit-product">Product</Label>
              <Select
                value={newOrder.productId}
                onValueChange={(value) =>
                  setNewOrder({ ...newOrder, productId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Employee */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Label htmlFor="edit-employee">Employee</Label>
                {/* Exclamation mark like in ViewModal */}
                <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 bg-muted text-muted-foreground cursor-pointer relative group">
                  <span className="text-xs font-bold">!</span> {/* Tooltip */}
                  <div className="absolute right-0 top-full mt-1 w-64 p-2 rounded-md bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    This is the user who entered this order into the system.
                  </div>
                </div>
              </div>
              <Select
                value={newOrder.userId}
                onValueChange={(value) => setNewOrder({ ...newOrder, userId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>

                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Quantity */}
            <div>
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
                type="number"
                value={newOrder.quantity}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, quantity: e.target.value })
                }
              />
            </div>
            {/* Status */}
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={newOrder.status}
                onValueChange={(value) =>
                  setNewOrder({ ...newOrder, status: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log("Updating order:", newOrder);
                setIsEditModalOpen(false);
              }}
            >
              Update Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>;

    </motion.div>
  );
};

export default Orders;