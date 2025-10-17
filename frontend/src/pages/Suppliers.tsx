import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Package2,
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  TrendingUp,
  Eye,
  Copy,
  CopyCheck,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AIInsightsSection from '@/components/shared/AIInsightsSection';
import { suppliersAPI, productsAPI, ordersAPI } from '@/lib/api';

interface Supplier {
  id: number;
  name: string;
  contact: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: number;
  supplier_name: string;
}

interface Order {
  id: number;
  product: number;
  product_name: string;
  user: number;
  user_name: string;
  quantity: number;
  status: string;
  total_price: string;
  date: string;
}

const Suppliers = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', phone: '' }); // for add
  const [editSupplier, setEditSupplier] = useState({ name: '', contact: '', phone: '' }); // for edit


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [suppliersData, productsData, ordersData] = await Promise.all([
        suppliersAPI.getAll(),
        productsAPI.getAll(),
        ordersAPI.getAll()
      ]);
      setSuppliers(suppliersData.results || suppliersData);
      setProducts(productsData.results || productsData);
      setOrders(ordersData.results || ordersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort function
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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

  // Helper functions (must be defined before sorting logic)
  const getProductsBySupplier = (supplierId: number) => {
    return products.filter(product => product.supplier === supplierId);
  };

  const getSupplierRevenue = (supplierId: number) => {
    // Get all products for this supplier
    const supplierProducts = getProductsBySupplier(supplierId);
    const supplierProductIds = supplierProducts.map(p => p.id);

    // Get all orders for products from this supplier
    const supplierOrders = orders.filter(order =>
      supplierProductIds.includes(order.product)
    );

    // Calculate total revenue from actual orders
    return supplierOrders.reduce((total, order) => {
      if (order.total_price) {
        return total + parseFloat(order.total_price);
      }
      // Fallback calculation if total_price is missing
      const product = supplierProducts.find(p => p.id === order.product);
      const price = product ? parseFloat(product.price.toString()) : 0;
      return total + (price * order.quantity);
    }, 0);
  };

  const getSupplierOrderCount = (supplierId: number) => {
    const supplierProducts = getProductsBySupplier(supplierId);
    const supplierProductIds = supplierProducts.map(p => p.id);
    return orders.filter(order => supplierProductIds.includes(order.product)).length;
  };

  const filteredAndSortedSuppliers = filteredSuppliers
    .sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'products':
          aValue = getProductsBySupplier(a.id).length;
          bValue = getProductsBySupplier(b.id).length;
          break;
        case 'orders':
          aValue = getSupplierOrderCount(a.id);
          bValue = getSupplierOrderCount(b.id);
          break;
        case 'revenue':
          aValue = getSupplierRevenue(a.id);
          bValue = getSupplierRevenue(b.id);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedSuppliers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedSuppliers = filteredAndSortedSuppliers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  const getSupplierDistributionData = () => {
    const colors = ['hsl(var(--primary))', 'hsl(var(--warning))', 'hsl(var(--success))', 'hsl(var(--accent))'];

    return suppliers.map((supplier, index) => ({
      name: supplier.name,
      value: getProductsBySupplier(supplier.id).length,
      fill: colors[index % colors.length]
    }));
  };

  const getRevenueData = () => {
    return suppliers.map(supplier => ({
      fullName: supplier.name, // full name for tooltip
      name: supplier.name.length > 10 ? supplier.name.substring(0, 10) + '...' : supplier.name, // for x-axis
      revenue: getSupplierRevenue(supplier.id),
      fill: 'hsl(var(--primary))'
    }));
  };



  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Copy failed: ", err);
    }
  };

  const formatJoinDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const canEditSuppliers = user?.role === 'Admin' || user?.role === 'Manager';
  const canViewRevenue = user?.role === 'Admin' || user?.role === 'Manager';

  // inside your component:
  const supplierDistributionData = useMemo(() => getSupplierDistributionData(), [suppliers, products]);

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      const total = supplierDistributionData.reduce((acc, cur) => acc + cur.value, 0);
      const percent = ((value / total) * 100).toFixed(1);

      return (
        <div className="p-2 rounded-md border bg-[hsl(var(--card))] shadow-md">
          <p className="font-medium text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{value} {t.products}</p>
          <p className="text-sm text-muted-foreground">{percent}%</p>
        </div>
      );
    }
    return null;
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
          <h1 className="text-3xl font-bold text-foreground">{t.supplierManagement}</h1>
          <p className="text-muted-foreground mt-1">{t.manageSupplierRelationships}</p>
        </div>
        {canEditSuppliers && (
          <Dialog open={isAddModalOpen} onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (open) {
              setNewSupplier({ name: '', contact: '', phone: '' });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                {t.addSupplier}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{t.addNewSupplier}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="name">{t.supplierName}</Label>
                  <Input
                    id="name"
                    value={newSupplier.name}
                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                    placeholder={t.enterSupplierName}
                  />
                </div>
                <div>
                  <Label htmlFor="contact">{t.contactEmail}</Label>
                  <Input
                    id="contact"
                    value={newSupplier.contact}
                    onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                    placeholder={t.enterContactEmail}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">{t.phoneNumber}</Label>
                  <Input
                    id="phone"
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                    placeholder={t.enterPhoneNumber}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>{t.cancel}</Button>
                <Button onClick={async () => {
                  try {
                    await suppliersAPI.create(newSupplier);
                    setIsAddModalOpen(false);
                    setNewSupplier({
                      name: '',
                      contact: '',
                      phone: ''
                    });
                    // Refresh the data
                    fetchData();
                  } catch (error) {
                    console.error('Error adding supplier:', error);
                  }
                }}>{t.add}</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="flex flex-col md:flex-row gap-6">
        <Card className='border-0 dark:border shadow-lg flex-1'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalSuppliers}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">
              {t.activeSuppliers}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 dark:border shadow-lg flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalProducts}</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              {t.suppliedProducts}
            </p>
          </CardContent>
        </Card>
        {canViewRevenue && (
          <Card className="border-0 dark:border shadow-lg flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.revenue}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl  font-bold">
                ${suppliers.reduce((total, supplier) => total + getSupplierRevenue(supplier.id), 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {t.fromAllSuppliers}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts */}
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="border-0 dark:border shadow-lg flex-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package2 className="h-5 w-5 text-primary" />
              <span className='text-md'>{t.productsBySupplier}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={supplierDistributionData}
                  cx="40%"
                  cy="50%"
                  outerRadius="80%"
                  dataKey="value"
                >
                  {supplierDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value) => (
                    <span className="text-xs sm:text-sm text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>




        {canViewRevenue && (
          <Card className="border-0 dark:border shadow-lg flex-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>{t.revenueBySupplier}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getRevenueData()}>
                  <CartesianGrid strokeDasharray="5 5" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    label={{
                      value: t.suppliers,
                      position: "insideBottom",
                      offset: 0,
                      fill: 'hsl(var(--foreground))'
                    }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    height={70}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    label={{
                      value: t.revenue + " ($)",
                      angle: -90,
                      position: "insideLeft",
                      offset: 0,
                      fill: 'hsl(var(--foreground))'
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2 rounded-md border bg-[hsl(var(--card))] shadow-md">
                            <p className="font-medium text-foreground">{data.fullName}</p>
                            <p className="text-muted-foreground text-sm">
                              {t.revenue}: ${data.revenue.toLocaleString()}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    radius={[4, 4, 0, 0]}
                  >
                    {getRevenueData().map((entry, index) => {
                      // find the corresponding color from supplierDistributionData
                      const colorEntry = supplierDistributionData.find(s => s.name === entry.fullName);
                      const fillColor = colorEntry ? colorEntry.fill : 'hsl(var(--primary))';
                      return <Cell key={`cell-${index}`} fill={fillColor} />;
                    })}
                  </Bar>
                </BarChart>

              </ResponsiveContainer>
            </CardContent>
          </Card>


        )}
      </div>

      {/* Suppliers Table */}
      <Card className="border-0 dark:border shadow-lg">
        <CardHeader>
          <CardTitle>{t.supplierDirectory}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.searchSuppliers}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center justify-between w-full hover:text-primary transition-colors"
                  >
                    <span>{t.supplier}</span>
                    {getSortIcon('name')}
                  </button>
                </TableHead>
                <TableHead className='hidden sm:table-cell'>{t.contactInformation}</TableHead>
                <TableHead className='hidden md:table-cell'>
                  <button
                    onClick={() => handleSort('products')}
                    className="flex items-center justify-between w-full hover:text-primary transition-colors"
                  >
                    <span>{t.products}</span>
                    {getSortIcon('products')}
                  </button>
                </TableHead>
                <TableHead className='hidden lg:table-cell'>
                  <button
                    onClick={() => handleSort('orders')}
                    className="flex items-center justify-between w-full hover:text-primary transition-colors"
                  >
                    <span>Orders</span>
                    {getSortIcon('orders')}
                  </button>
                </TableHead>
                {canViewRevenue && (
                  <TableHead className='hidden xl:table-cell'>
                    <button
                      onClick={() => handleSort('revenue')}
                      className="flex items-center justify-between w-full hover:text-primary transition-colors"
                    >
                      <span>{t.revenue}</span>
                      {getSortIcon('revenue')}
                    </button>
                  </TableHead>
                )}
                {canEditSuppliers && <TableHead className="text-right">{t.actions}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{supplier.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {supplier.id}</div>
                    </div>
                  </TableCell>
                  <TableCell className='hidden sm:table-cell'>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                        {supplier.contact}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                        {supplier.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='hidden md:table-cell'>
                    <div className="text-sm">
                      <span className="font-medium">{getProductsBySupplier(supplier.id).length}</span>
                    </div>
                  </TableCell>
                  <TableCell className='hidden lg:table-cell'>
                    <div className="text-sm">
                      <span className="font-medium">{getSupplierOrderCount(supplier.id)}</span>
                    </div>
                  </TableCell>
                  {canViewRevenue && (
                    <TableCell className='hidden xl:table-cell'>
                      <div className="font-medium">
                        ${getSupplierRevenue(supplier.id).toLocaleString()}
                      </div>
                    </TableCell>
                  )}
                  {canEditSuppliers && (
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSupplier(supplier);
                            // Populate editSupplier with the current supplier info
                            setEditSupplier({
                              name: supplier.name,
                              contact: supplier.contact,
                              phone: supplier.phone,
                            });
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this supplier?')) {
                              try {
                                // First delete from backend
                                await suppliersAPI.delete(supplier.id);
                                // Only update state if backend deletion succeeds
                                setSuppliers(prevSuppliers => prevSuppliers.filter(s => s.id !== supplier.id));
                              } catch (error) {
                                console.error('Error deleting supplier:', error);
                                // Only show error if backend actually fails
                                alert('Error deleting supplier. Please try again.');
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAndSortedSuppliers.length === 0 && (
            <div className="text-center py-8">
              <Package2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.supplierNotFound}</p>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredAndSortedSuppliers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 pt-4">
              {/* Page Size Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
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
                <span className="text-sm text-muted-foreground">entries</span>
              </div>
              {/* Pagination Info */}
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedSuppliers.length)} of {filteredAndSortedSuppliers.length} results
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
          suppliers: filteredAndSortedSuppliers,
          totalSuppliers: suppliers.length,
          displayedSuppliers: filteredAndSortedSuppliers.length,
          searchTerm: searchTerm,
          products: products,
          orders: orders,
          supplierProducts: products.reduce((acc, product) => {
            const supplierId = product.supplier;
            acc[supplierId] = (acc[supplierId] || 0) + 1;
            return acc;
          }, {} as Record<number, number>),
          supplierRevenue: products.reduce((acc, product) => {
            const supplierId = product.supplier;
            const revenue = orders
              .filter(order => order.product === product.id && order.status === 'Delivered')
              .reduce((sum, order) => sum + order.quantity * product.price, 0);
            acc[supplierId] = (acc[supplierId] || 0) + revenue;
            return acc;
          }, {} as Record<number, number>)
        }} 
        pageType="suppliers" 
      />

      {/* View Supplier Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.supplier} {t.details}</DialogTitle>
          </DialogHeader>
          {selectedSupplier ? (
            <div className="py-4 space-y-4">

              {/* Supplier Name */}
              <div className="bg-muted rounded-lg p-3 flex items-center space-x-3">
                <Package2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{t.supplierName}</p>
                  <p className="text-sm text-muted-foreground">{selectedSupplier.name}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between bg-muted rounded-lg">
                <div className="flex items-center space-x-3 p-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.email}</p>
                    <p className="text-sm text-muted-foreground">{selectedSupplier.contact}</p>
                  </div>
                </div>
                <Button
                  className="mx-2"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(selectedSupplier.contact, "email")}
                >
                  {copiedField === "email" ? (
                    <CopyCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between bg-muted rounded-lg">
                <div className="flex items-center space-x-3 p-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.phone}</p>
                    <p className="text-sm text-muted-foreground">{selectedSupplier.phone}</p>
                  </div>
                </div>
                <Button
                  className="mx-2"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(selectedSupplier.phone, "phone")}
                >
                  {copiedField === "phone" ? (
                    <CopyCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>


              {/* Join Date */}
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Joined On</p>
                    <p className="text-sm text-muted-foreground">
                      {formatJoinDate(selectedSupplier.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg flex flex-col items-center">
                  <p className="text-sm text-muted-foreground">{t.products}</p>
                  <p className="text-lg font-bold text-foreground">
                    {getProductsBySupplier(selectedSupplier.id).length}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg flex flex-col items-center">
                  <p className="text-sm text-muted-foreground">Orders</p>
                  <p className="text-lg font-bold text-foreground">
                    {getSupplierOrderCount(selectedSupplier.id)}
                  </p>
                </div>
                <div className="col-span-2 p-3 bg-muted rounded-lg flex flex-col items-center">
                  <p className="text-sm text-muted-foreground">{t.revenue}</p>
                  <p className="text-xl font-bold text-foreground">
                    ${getSupplierRevenue(selectedSupplier.id).toLocaleString()}
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-muted-foreground">No Supplier Selected</p>
            </div>
          )}
        </DialogContent>
      </Dialog>


      {/* Edit Supplier Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t.editSupplier}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-name">{t.supplierName}</Label>
              <Input
                id="edit-name"
                value={editSupplier.name} // Use editSupplier here
                onChange={(e) => setEditSupplier({ ...editSupplier, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-contact">{t.contactEmail}</Label>
              <Input
                id="edit-contact"
                value={editSupplier.contact}
                onChange={(e) => setEditSupplier({ ...editSupplier, contact: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">{t.phoneNumber}</Label>
              <Input
                id="edit-phone"
                value={editSupplier.phone}
                onChange={(e) => setEditSupplier({ ...editSupplier, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>{t.cancel}</Button>
            <Button onClick={async () => {
              try {
                if (selectedSupplier) {
                  await suppliersAPI.update(selectedSupplier.id, editSupplier);
                  setIsEditModalOpen(false);
                  // Refresh the data
                  fetchData();
                }
              } catch (error) {
                console.error('Error updating supplier:', error);
              }
            }}>{t.edit}</Button>
          </div>
        </DialogContent>
      </Dialog>


    </motion.div>
  );
};

export default Suppliers;