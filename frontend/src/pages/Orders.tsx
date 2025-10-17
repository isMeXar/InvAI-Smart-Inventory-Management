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
  Package2,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown
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
import AIInsightsSection from '@/components/shared/AIInsightsSection';
import { ordersAPI, productsAPI, usersAPI } from '@/lib/api';

interface Order {
  id: number;
  product: number;
  product_name?: string;
  user: number;
  user_name?: string;
  quantity: number;
  status: 'Shipped' | 'Processing' | 'Delivered' | 'Pending' | 'Cancelled';
  total_price?: string;
  date?: string;
  updated_at?: string;
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
  username: string;
  first_name: string;
  last_name: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Employee';
  email: string;
  phone: string | null;
  profile_pic: string | null;
  profilePic?: string;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOwnershipModalOpen, setIsOwnershipModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newOrder, setNewOrder] = useState({
    product: '',
    user: user?.id?.toString() || '',
    quantity: '',
    status: 'Pending'
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Update default user when user context changes
  useEffect(() => {
    if (user?.id) {
      setNewOrder(prev => ({ ...prev, user: user.id.toString() }));
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [ordersData, productsData, usersData] = await Promise.all([
        ordersAPI.getAll(),
        productsAPI.getAll(),
        usersAPI.getAll()
      ]);
      setOrders(ordersData.results || ordersData);
      setProducts(productsData.results || productsData);
      setUsers(usersData.results || usersData);
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
    if (order.total_price) return parseFloat(order.total_price.toString());
    const product = getProduct(order.product);
    return product ? parseFloat(product.price.toString()) * order.quantity : 0;
  };

  // Sort function
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedOrders = orders
    .filter(order => {
      const product = getProduct(order.product);
      const user = getUser(order.user);
      const matchesSearch = product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;

      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'product':
          aValue = getProduct(a.product)?.name || '';
          bValue = getProduct(b.product)?.name || '';
          break;
        case 'user':
          aValue = getUser(a.user)?.name || '';
          bValue = getUser(b.user)?.name || '';
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'date':
          aValue = new Date(a.date || 0);
          bValue = new Date(b.date || 0);
          break;
        case 'total':
          aValue = getOrderValue(a);
          bValue = getOrderValue(b);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedOrders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = filteredAndSortedOrders.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, pageSize]);

  // Sort icon helper - always show arrow, highlight when active
  const getSortIcon = (field: string) => {
    const isActive = sortField === field;
    const iconClass = isActive ? "h-4 w-4 text-primary" : "h-4 w-4 text-muted-foreground opacity-50";

    if (isActive) {
      return sortDirection === 'asc' ? (
        <ArrowDown className={iconClass} />
      ) : (
        <ArrowUp className={iconClass} />
      );
    }

    // Show neutral arrow when not active
    return <ArrowDown className={iconClass} />;
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
      const orderCount = orders.filter(order => order.product === product.id).length;
      return {
        name: product.name.length > 10 ? product.name.substring(0, 10) + '...' : product.name, // for X-axis
        fullName: product.name, // full name for tooltip
        orders: orderCount,
        fill: 'hsl(var(--primary))'
      };
    }).filter(item => item.orders > 0);

    return productOrders;
  };


  const getMonthlyRevenueData = () => {
    // Group orders by month from actual data
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Initialize all months with 0
    months.forEach(month => {
      monthlyData[month] = { orders: 0, revenue: 0 };
    });

    // Process actual orders
    orders.forEach(order => {
      if (order.date) {
        const orderDate = new Date(order.date);
        const monthName = months[orderDate.getMonth()];
        monthlyData[monthName].orders += 1;
        monthlyData[monthName].revenue += getOrderValue(order);
      }
    });

    return months.map(month => ({
      month,
      orders: monthlyData[month].orders,
      revenue: monthlyData[month].revenue,
    }));
  };

  const getTotalRevenue = () => {
    return orders.reduce((total, order) => total + getOrderValue(order), 0);
  };

  const canEditOrders = user?.role === 'Admin' || user?.role === 'Manager';
  const canCreateOrders = user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Employee';
  const canViewRevenue = user?.role === 'Admin' || user?.role === 'Manager';
  const canViewOrderDetails = user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Employee';
  const canViewOrderPrices = user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'Employee';

  // Check if user can edit a specific order
  const canEditSpecificOrder = (order: Order) => {
    if (user?.role === 'Admin' || user?.role === 'Manager') return true;
    if (user?.role === 'Employee' && order.user === user.id) return true;
    return false;
  };
  // const [activeFilter, setActiveFilter] = useState<'search' | 'status' | null>(null);
  const [activeFilter, setActiveFilter] = useState<'search' | 'status'>('status');

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const formatFullDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
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
        {canCreateOrders && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                {t.newOrder}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t.addNewOrder}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="product">{t.product}</Label>
                  <Select value={newOrder.product} onValueChange={(value) => setNewOrder({ ...newOrder, product: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectProduct} />
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
                  <Label htmlFor="employee">Employee</Label>
                  <Select value={newOrder.user} onValueChange={(value) => setNewOrder({ ...newOrder, user: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectEmployee} />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(userOption => (
                        <SelectItem key={userOption.id} value={userOption.id.toString()}>
                          {userOption.name || userOption.username} {userOption.id === user?.id && "(Me)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">{t.quantity}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newOrder.quantity}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
                    placeholder={t.enterQuantity}
                  />
                </div>
                <div>
                  <Label htmlFor="status">{t.status}</Label>
                  <Select value={newOrder.status} onValueChange={(value) => setNewOrder({ ...newOrder, status: value as Order['status'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">{t.pending}</SelectItem>
                      <SelectItem value="Processing">{t.processing}</SelectItem>
                      <SelectItem value="Shipped">{t.shipped}</SelectItem>
                      <SelectItem value="Delivered">{t.delivered}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>{t.cancel}</Button>
                <Button onClick={async () => {
                  try {
                    if (!newOrder.product || !newOrder.user || !newOrder.quantity) {
                      alert('Please fill in all required fields');
                      return;
                    }

                    const orderData = {
                      product: parseInt(newOrder.product),
                      user: parseInt(newOrder.user),
                      quantity: parseInt(newOrder.quantity),
                      status: newOrder.status
                    };

                    await ordersAPI.create(orderData);
                    await fetchData(); // Refresh data
                    setIsAddModalOpen(false);
                    setNewOrder({
                      product: '',
                      user: user?.id?.toString() || '',
                      quantity: '',
                      status: 'Pending'
                    });
                  } catch (error) {
                    console.error('Error adding order:', error);
                    alert('Error adding order. Please try again.');
                  }
                }}>{t.add}</Button>
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
            <div className="text-xl md:text-2xl font-bold">{orders.length}</div>
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
              <div className="text-xl md:text-2xl font-bold">${getTotalRevenue().toLocaleString()}</div>
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
            <div className="text-xl md:text-2xl font-bold">
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
            <div className="text-xl md:text-2xl font-bold">
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
              <span className='text-xl md:text-2xl'>{t.ordersByStatus}</span>
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
                <span className='text-xl md:text-2xl'>{t.ordersPerProduct}</span>
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
                          <p className="font-medium text-foreground">{payload[0].payload.fullName}</p> {/* full name */}
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
            <span className='text-xl md:text-2xl'>{t.monthlyOrdersRevenue}</span>
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
          <CardTitle className='text-xl md:text-2xl'>{t.orderHistory}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            {/* Search */}
            <div className="relative flex-1 hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.searchOrders}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="hidden md:block">
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

            {/* Mobile version */}
            <div className="flex flex-1 gap-2 md:hidden">
              {activeFilter === 'search' ? (
                <div className="relative flex-1">
                  <Search
                    onClick={() => setActiveFilter('status')}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
                  />
                  <Input
                    placeholder={t.searchOrders}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setActiveFilter('search')}
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}

              {activeFilter === 'status' ? (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1">
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
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setActiveFilter('status')}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>


          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort('id')}
                    className="flex items-center justify-between w-full hover:text-primary transition-colors"
                  >
                    <span>ID</span>
                    {getSortIcon('id')}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('product')}
                    className="flex items-center justify-between w-full hover:text-primary transition-colors"
                  >
                    <span>{t.product}</span>
                    {getSortIcon('product')}
                  </button>
                </TableHead>
                <TableHead className='hidden lg:table-cell'>
                  <button
                    onClick={() => handleSort('user')}
                    className="flex items-center justify-between w-full hover:text-primary transition-colors"
                  >
                    <span>{t.employee}</span>
                    {getSortIcon('user')}
                  </button>
                </TableHead>
                <TableHead className='hidden md:table-cell'>
                  <button
                    onClick={() => handleSort('quantity')}
                    className="flex items-center justify-between w-full hover:text-primary transition-colors"
                  >
                    <span>{t.quantity}</span>
                    {getSortIcon('quantity')}
                  </button>
                </TableHead>
                <TableHead className='hidden sm:table-cell'>
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center justify-between w-full hover:text-primary transition-colors"
                  >
                    <span>Date</span>
                    {getSortIcon('date')}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center justify-between w-full hover:text-primary transition-colors"
                  >
                    <span>{t.status}</span>
                    {getSortIcon('status')}
                  </button>
                </TableHead>
                {canViewOrderPrices && (
                  <TableHead className='hidden md:table-cell'>
                    <button
                      onClick={() => handleSort('total')}
                      className="flex items-center justify-between w-full hover:text-primary transition-colors"
                    >
                      <span>{t.total}</span>
                      {getSortIcon('total')}
                    </button>
                  </TableHead>
                )}
                <TableHead className="text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => {
                const product = getProduct(order.product);
                const user = getUser(order.user);
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
                    <TableCell className='hidden sm:table-cell'>
                      <div className="text-sm">
                        {order.date ? new Date(order.date).toLocaleDateString('en-GB') : 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(
                        order.status
                      )} flex items-center gap-1 w-fit`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </TableCell>
                    {canViewOrderPrices && (
                      <TableCell className='hidden md:table-cell'>
                        <div className="font-medium">
                          ${getOrderValue(order).toLocaleString()}
                        </div>
                      </TableCell>
                    )}
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
                            if (canEditSpecificOrder(order)) {
                              setSelectedOrder(order);
                              setNewOrder({
                                product: order.product.toString(),
                                user: order.user.toString(),
                                quantity: order.quantity.toString(),
                                status: order.status
                              });
                              setIsEditModalOpen(true);
                            } else {
                              setSelectedOrder(order);
                              setIsOwnershipModalOpen(true);
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={async () => {
                            if (!canEditSpecificOrder(order)) {
                              setSelectedOrder(order);
                              setIsOwnershipModalOpen(true);
                              return;
                            }

                            if (confirm('Are you sure you want to delete this order?')) {
                              try {
                                await ordersAPI.delete(order.id);
                                setOrders(prevOrders => prevOrders.filter(o => o.id !== order.id));
                              } catch (error) {
                                console.error('Error deleting order:', error);
                                alert('Error deleting order. Please try again.');
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {filteredAndSortedOrders.length === 0 && (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.orderNotFound}</p>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredAndSortedOrders.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 pt-4">
              {/* Page Size Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">per page</span>
              </div>

              {/* Pagination Info */}
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedOrders.length)} of {filteredAndSortedOrders.length} results
              </div>

              {/* Pagination Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0 rounded-full"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <AIInsightsSection 
        data={{
          orders: filteredAndSortedOrders,
          totalOrders: orders.length,
          displayedOrders: filteredAndSortedOrders.length,
          statusFilter: statusFilter,
          statusCounts: {
            Pending: orders.filter(o => o.status === 'Pending').length,
            Shipped: orders.filter(o => o.status === 'Shipped').length,
            Delivered: orders.filter(o => o.status === 'Delivered').length,
            Cancelled: orders.filter(o => o.status === 'Cancelled').length,
          },
          products: products,
          users: users,
          totalRevenue: orders
            .filter(o => o.status === 'Delivered')
            .reduce((sum, order) => sum + (Number(order.total_price) || 0), 0),
          pendingRevenue: orders
            .filter(o => o.status === 'Pending' || o.status === 'Shipped')
            .reduce((sum, order) => sum + (Number(order.total_price) || 0), 0)
        }} 
        pageType="orders" 
      />

      {/* View Order Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.orders + " " + t.details}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* General Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t.orderID}</Label>
                  <p className="text-foreground font-medium">#{selectedOrder.id}</p>
                </div>
                <div>
                  <Label>{t.status}</Label>
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
                  <Label>{t.product}</Label>
                  <p className="text-foreground font-medium">
                    {getProduct(selectedOrder.product)?.name || selectedOrder.product_name || "Unknown Product"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {getProduct(selectedOrder.product)?.category || "Unavailable"}
                  </p>
                </div>
                <div>
                  <Label>{t.quantity}</Label>
                  <p className="text-foreground font-medium">
                    {selectedOrder.quantity}
                  </p>
                </div>
                <div>
                  <Label>{t.totalValue}</Label>
                  <p className="text-foreground font-medium">
                    ${getOrderValue(selectedOrder).toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label>Order Date</Label>
                  <p className="text-foreground font-medium">
                    {formatFullDate(selectedOrder.date)}
                  </p>
                </div>
              </div>

              {/* Employee Info */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold">{t.employee}</h3>
                  <div className="relative group">
                    <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 bg-muted text-muted-foreground cursor-pointer">
                      <span className="text-xs font-bold">!</span>
                    </div>
                    {/* Tooltip */}
                    <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 min-w-[200px] max-w-[90vw] p-2 rounded-md bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50 text-left break-words">
                      {t.userTooltip}
                    </div>


                  </div>
                </div>

                {(() => {
                  const employee = getUser(selectedOrder.user);
                  return (
                    <div className="space-y-4">
                      {/* Top row: Avatar + Name + Role */}
                      <div className="flex items-center gap-4">
                        <img
                          src={employee?.profile_pic || employee?.profilePic || `https://randomuser.me/api/portraits/${employee?.first_name === 'Alice' || employee?.first_name === 'Diana' ? 'women' : 'men'}/1.jpg`}
                          alt={employee?.name || employee?.username || "Employee"}
                          className="w-14 h-14 rounded-full object-cover border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://randomuser.me/api/portraits/men/1.jpg';
                          }}
                        />
                        <div>
                          <p className="text-foreground font-medium">
                            {employee?.name || employee?.username || selectedOrder.user_name || "Unavailable"}
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
                            <Label className="text-sm">{t.contactEmail}</Label>
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
                            <Label className="text-sm">{t.phoneNumber}</Label>
                            <span className="text-sm text-foreground truncate">
                              {employee?.phone || "No phone number"}
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
            <DialogTitle>{t.editOrder}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Product - Only show if user can edit all orders */}
            {canEditOrders && (
              <div>
                <Label htmlFor="edit-product">{t.product}</Label>
                <Select
                  value={newOrder.product}
                  onValueChange={(value) =>
                    setNewOrder({ ...newOrder, product: value })
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
            )}

            {/* Show product as read-only for employees */}
            {!canEditOrders && selectedOrder && (
              <div>
                <Label>{t.product}</Label>
                <div className="p-2 bg-muted rounded-md text-sm text-foreground">
                  {getProduct(selectedOrder.product)?.name || 'Unknown Product'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Product cannot be changed</p>
              </div>
            )}

            {/* Employee - Only show if user can edit all orders */}
            {canEditOrders && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor="edit-employee">{t.employee}</Label>
                  <div className="w-5 h-5 flex items-center justify-center rounded-full border-2 bg-muted text-muted-foreground cursor-pointer relative group">
                    <span className="text-xs font-bold">!</span>
                    <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 min-w-[200px] max-w-[90vw] p-2 rounded-md bg-gray-800 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50 text-left break-words">
                      {t.userTooltip}
                    </div>
                  </div>
                </div>
                <Select
                  value={newOrder.user}
                  onValueChange={(value) => setNewOrder({ ...newOrder, user: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectEmployee} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((userOption) => (
                      <SelectItem key={userOption.id} value={userOption.id.toString()}>
                        {userOption.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Show employee as read-only for employees */}
            {!canEditOrders && selectedOrder && (
              <div>
                <Label>{t.employee}</Label>
                <div className="p-2 bg-muted rounded-md text-sm text-foreground">
                  {getUser(selectedOrder.user)?.name || 'Unknown Employee'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Employee assignment cannot be changed</p>
              </div>
            )}
            {/* Quantity */}
            <div>
              <Label htmlFor="edit-quantity">{t.quantity}</Label>
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
              <Label htmlFor="edit-status">{t.status}</Label>
              <Select
                value={newOrder.status}
                onValueChange={(value) =>
                  setNewOrder({ ...newOrder, status: value as Order['status'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">{t.pending}</SelectItem>
                  <SelectItem value="Processing">{t.processing}</SelectItem>
                  <SelectItem value="Shipped">{t.shipped}</SelectItem>
                  <SelectItem value="Delivered">{t.delivered}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {t.cancel}
            </Button>
            <Button
              onClick={async () => {
                try {
                  if (!selectedOrder || !newOrder.product || !newOrder.user || !newOrder.quantity) {
                    alert('Please fill in all required fields');
                    return;
                  }

                  const orderData = {
                    product: parseInt(newOrder.product),
                    user: parseInt(newOrder.user),
                    quantity: parseInt(newOrder.quantity),
                    status: newOrder.status
                  };

                  await ordersAPI.update(selectedOrder.id, orderData);
                  await fetchData(); // Refresh data
                  setIsEditModalOpen(false);
                } catch (error) {
                  console.error('Error updating order:', error);
                  alert('Error updating order. Please try again.');
                }
              }}
            >
              {t.edit}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ownership Restriction Modal */}
      <Dialog open={isOwnershipModalOpen} onOpenChange={setIsOwnershipModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                <span className="text-warning text-lg">⚠️</span>
              </div>
              Access Restricted
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-foreground">
              You can only edit or delete orders that you created yourself.
            </p>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Reason:</strong> This policy ensures order integrity and prevents accidental modifications or deletions to orders handled by other employees.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>What you can do:</strong>
              </p>
              <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                <li>• View order details (click the eye icon)</li>
                <li>• Edit/delete orders you created</li>
                <li>• Contact a Manager or Admin for help with other orders</li>
              </ul>
            </div>
            {selectedOrder && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>This order was created by:</strong> {getUser(selectedOrder.user)?.name || 'Unknown Employee'}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setIsOwnershipModalOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </motion.div>
  );
};

export default Orders;