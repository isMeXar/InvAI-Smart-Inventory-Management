import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import {
  Package,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Filter,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AIInsights from '@/components/shared/AIInsights';
import { productsAPI, suppliersAPI, ordersAPI } from '@/lib/api';

interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: number;
  supplier_name?: string;
  min_stock?: number;
  description?: string;
  stock_level?: string;
  created_at?: string;
  updated_at?: string;
}

interface Supplier {
  id: number;
  name: string;
  contact?: string;
  phone?: string;
}

interface Order {
  id: number;
  product: number;
  product_name?: string;
  user: number;
  user_name?: string;
  quantity: number;
  status: string;
  total_price?: number;
  date?: string;
}

const Products = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addProduct, setAddProduct] = useState({
    name: '',
    category: '',
    supplier: '',
    price: '',
    quantity: '',
    minStock: '',
    description: ''
  });
  const [editProduct, setEditProduct] = useState({
    name: '',
    category: '',
    supplier: '',
    price: '',
    quantity: '',
    minStock: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, suppliersData, ordersData] = await Promise.all([
        productsAPI.getAll(),
        suppliersAPI.getAll(),
        ordersAPI.getAll()
      ]);

      setProducts(productsData.results || productsData);
      setSuppliers(suppliersData.results || suppliersData);
      setOrders(ordersData.results || ordersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [...new Set(products.map(p => p.category))];
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);


  // Sort function
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort icon helper
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

    return <ArrowDown className={iconClass} />;
  };

  // Helper functions (must be defined before sorting logic)
  const getSupplierName = (supplierId: number) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'Unknown';
  };

  const getItemsSold = (productId: number) => {
    return orders
      .filter(order => order.product === productId && (order.status === 'Delivered'))
      .reduce((total, order) => total + order.quantity, 0);
  };

  const getProductRevenue = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    const itemsSold = getItemsSold(productId);
    return itemsSold * product.price;
  };

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesSupplier = supplierFilter === 'all' || product.supplier.toString() === supplierFilter;
      const matchesStock = stockFilter === 'all' ||
        (stockFilter === 'low' && product.quantity < 50) ||
        (stockFilter === 'sufficient' && product.quantity >= 50);

      return matchesSearch && matchesCategory && matchesSupplier && matchesStock;
    })
    .sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortField) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'supplier':
          aValue = getSupplierName(a.supplier).toLowerCase();
          bValue = getSupplierName(b.supplier).toLowerCase();
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'sold':
          aValue = getItemsSold(a.id);
          bValue = getItemsSold(b.id);
          break;
        case 'revenue':
          aValue = getProductRevenue(a.id);
          bValue = getProductRevenue(b.id);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, supplierFilter, stockFilter, pageSize]);


  const getStockLevel = (quantity: number) => {
    if (quantity < 20) return { level: 'Critical', color: 'destructive' }; // red
    if (quantity < 50) return { level: 'Low', color: 'warning' };         // orange
    return { level: 'Good', color: 'success' };                            // green
  };


  const getTotalRevenue = () => {
    return products.reduce((total, product) => total + getProductRevenue(product.id), 0);
  };

  const inventoryChartData = products.map(p => ({
    name: p.name.split(' ').slice(0, 2).join(' '),
    quantity: p.quantity,
    fill: p.quantity < 20 ? 'hsl(0 84% 60% / 0.8)' : p.quantity < 50 ? 'hsl(38 92% 50% / 0.8)' : 'hsl(217 91% 60% / 0.8)'
  }));

  const revenueChartData = products.map(p => ({
    name: p.name.split(' ').slice(0, 2).join(' '),
    revenue: getProductRevenue(p.id),
    fill: 'hsl(142 76% 46% / 0.8)'
  }));

  const handleAddProduct = async () => {
    // Validate required fields
    if (!addProduct.name || !addProduct.category || !addProduct.supplier || !addProduct.price || !addProduct.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const productData = {
        name: addProduct.name,
        category: addProduct.category,
        supplier: parseInt(addProduct.supplier),
        price: parseFloat(addProduct.price),
        quantity: parseInt(addProduct.quantity),
        min_stock: addProduct.minStock ? parseInt(addProduct.minStock) : 10,
        description: addProduct.description
      };

      await productsAPI.create(productData);
      await fetchData(); // Refresh the product list
      setIsAddModalOpen(false);
      setAddProduct({
        name: '',
        category: '',
        supplier: '',
        price: '',
        quantity: '',
        minStock: '',
        description: ''
      });
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    }
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditProduct({
      name: product.name,
      category: product.category,
      supplier: product.supplier.toString(),
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      minStock: product.min_stock?.toString() || '',
      description: product.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(productId);
        await fetchData(); // Refresh the product list
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const canEdit = user?.role === 'Admin' || user?.role === 'Manager';
  const canViewRevenue = user?.role === 'Admin' || user?.role === 'Manager';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
        <span className="ml-3 text-muted-foreground">{t.loadingProducts}</span>
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
          <h1 className="text-3xl font-bold text-foreground">{t.products}</h1>
          <p className="text-muted-foreground mt-1">
            {t.manageProductInventory}
          </p>
        </div>

        {canEdit && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                {t.addProduct}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{t.addNewProduct}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <Label htmlFor="name">{t.productName}</Label>
                  <Input
                    id="name"
                    value={addProduct.name}
                    onChange={(e) => setAddProduct({ ...addProduct, name: e.target.value })}
                    placeholder={t.enterProductName}
                  />
                </div>
                <div>
                  <Label htmlFor="category">{t.category}</Label>
                  <Select value={addProduct.category} onValueChange={(value) => setAddProduct({ ...addProduct, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectCategory} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                      {categories.filter(cat => !['Electronics', 'Furniture', 'Office Supplies'].includes(cat)).map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supplier">{t.supplier}</Label>
                  <Select value={addProduct.supplier} onValueChange={(value) => setAddProduct({ ...addProduct, supplier: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectSupplier} />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">{t.price} ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={addProduct.price}
                    onChange={(e) => setAddProduct({ ...addProduct, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">{t.quantityInStock}</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={addProduct.quantity}
                    onChange={(e) => setAddProduct({ ...addProduct, quantity: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="minStock">{t.minimumStockLevel}</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={addProduct.minStock}
                    onChange={(e) => setAddProduct({ ...addProduct, minStock: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">{t.description}</Label>
                  <Textarea
                    id="description"
                    value={addProduct.description}
                    onChange={(e) => setAddProduct({ ...addProduct, description: e.target.value })}
                    placeholder={t.productDescription}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>{t.cancel}</Button>
                <Button onClick={handleAddProduct}>{t.add}</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="border-0 dark:border shadow-lg flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalProducts}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">{t.activeProducts}</p>
          </CardContent>
        </Card>

        {canViewRevenue && (
          <Card className="border-0 dark:border shadow-lg flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalRevenue}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${getTotalRevenue().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{t.fromProductSales}</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 dark:border shadow-lg flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.lowStockItems}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.quantity < 50).length}
            </div>
            <p className="text-xs text-muted-foreground">{t.needRestocking}</p>
          </CardContent>
        </Card>

        <Card className="border-0 dark:border shadow-lg flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.categories}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">{t.productCategories}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Inventory Levels Chart */}
        <Card className="border-0 dark:border shadow-lg flex-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <span>{t.inventoryLevels}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryChartData}>
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={70}
                  label={{
                    value: t.products,
                    position: "insideBottom",
                    offset: 5,
                    fill: 'hsl(var(--foreground))'
                  }}
                  tick={false}
                />
                <YAxis
                  allowDecimals={false}
                  label={{
                    value: t.quantity,
                    angle: -90,
                    position: "insideLeft",
                    offset: 0,
                    fill: 'hsl(var(--foreground))'
                  }}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <CartesianGrid strokeDasharray="5 5" stroke="hsl(var(--border))" vertical={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-2 rounded-md border bg-[hsl(var(--card))] shadow-md">
                          {/* Title: product name or translated text */}
                          <p className="font-medium text-foreground">{label}</p>
                          {/* Value line with translation */}
                          <p className="text-sm text-muted-foreground">
                            {t.quantity}: {payload[0].value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Legend
                  verticalAlign="top"
                  height={36}
                  content={() => (
                    <div className="flex justify-center gap-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: 'hsl(0 84% 60% / 0.8)' }}></div>
                        <span className="text-sm text-muted-foreground">{t.critical} (&lt; 20)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: 'hsl(38 92% 50% / 0.8)' }}></div>
                        <span className="text-sm text-muted-foreground">{t.low} (20-50)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: 'hsl(217 91% 60% / 0.8)' }}></div>
                        <span className="text-sm text-muted-foreground">{t.sufficient} (≥50)</span>
                      </div>
                    </div>
                  )}
                />
                <Bar
                  dataKey="quantity"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue per Product Chart (Admin/Manager only) */}
        {canViewRevenue && (
          <Card className="border-0 dark:border shadow-lg flex-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <span>{t.revenuePerProduct}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="5 5" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    height={70}
                    label={{
                      value: t.products,
                      position: "insideBottom",
                      offset: 5,
                      fill: 'hsl(var(--foreground))'
                    }}
                    tick={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    label={{
                      value: t.revenue + " ($)",
                      angle: -90,
                      position: "insideLeft",
                      offset: 0,
                      fill: 'hsl(var(--foreground))'
                    }}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="p-2 rounded-md border bg-[hsl(var(--card))] shadow-md">
                            <p className="font-medium text-foreground">{label}</p>
                            <p className="text-sm text-muted-foreground">
                              {t.revenue}: ${payload[0].value.toLocaleString()}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  <Legend
                    verticalAlign="top"
                    height={36}
                    content={() => (
                      <div className="flex justify-center gap-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: 'hsl(142 76% 46% / 0.8)' }}></div>
                          <span className="text-sm text-muted-foreground">{t.revenue}</span>
                        </div>
                      </div>
                    )}
                  />
                  <Bar
                    dataKey="revenue"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Products Table */}
      <Card className="border-0 dark:border shadow-lg">
        <CardHeader>
          <CardTitle>{t.productInventory} ({filteredAndSortedProducts.length} {t.products})</CardTitle>
        </CardHeader>
        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            {/* Simple Filter */}
            <div className="flex gap-2 mb-2">
              <Input
                placeholder={t.searchProductsPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm flex-1 h-10" // fixed height
              />
              <Button
                variant="outline"
                size="sm"
                className="h-10 flex items-center justify-center" // same height as input
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>


            {/* Advanced Filters (Toggleable) */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder={t.allCategories} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allCategories}</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Supplier Filter */}
                <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder={t.allSuppliers} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allSuppliers}</SelectItem>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Stock Filter */}
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder={t.allLevels} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allLevels}</SelectItem>
                    <SelectItem value="low">{t.lowStock}</SelectItem>
                    <SelectItem value="sufficient">{t.sufficientStock}</SelectItem>
                  </SelectContent>
                </Select>

              </div>
            )}

          </CardContent>
        </Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center justify-between w-full hover:text-primary transition-colors"
                    >
                      <span>Product</span>
                      {getSortIcon('name')}
                    </button>
                  </TableHead>
                  <TableHead className='hidden md:table-cell'>
                    <button
                      onClick={() => handleSort('category')}
                      className="flex items-center justify-between w-full hover:text-primary transition-colors"
                    >
                      <span>{t.category}</span>
                      {getSortIcon('category')}
                    </button>
                  </TableHead>
                  <TableHead className='hidden lg:table-cell'>
                    <button
                      onClick={() => handleSort('supplier')}
                      className="flex items-center justify-between w-full hover:text-primary transition-colors"
                    >
                      <span>{t.supplier}</span>
                      {getSortIcon('supplier')}
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
                  <TableHead className='hidden lg:table-cell'>
                    <button
                      onClick={() => handleSort('price')}
                      className="flex items-center justify-between w-full hover:text-primary transition-colors"
                    >
                      <span>{t.price}</span>
                      {getSortIcon('price')}
                    </button>
                  </TableHead>
                  <TableHead className='hidden sm:table-cell'>{t.stockLevel}</TableHead>
                  {canViewRevenue && (
                    <TableHead className='hidden lg:table-cell'>
                      <button
                        onClick={() => handleSort('sold')}
                        className="flex items-center justify-between w-full hover:text-primary transition-colors"
                      >
                        <span>{t.sold}</span>
                        {getSortIcon('sold')}
                      </button>
                    </TableHead>
                  )}
                  {canViewRevenue && (
                    <TableHead className='hidden lg:table-cell'>
                      <button
                        onClick={() => handleSort('revenue')}
                        className="flex items-center justify-between w-full hover:text-primary transition-colors"
                      >
                        <span>{t.revenue}</span>
                        {getSortIcon('revenue')}
                      </button>
                    </TableHead>
                  )}
                  <TableHead>{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.map((product) => {
                  const stockLevel = getStockLevel(product.quantity);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className='hidden md:table-cell'>{product.category}</TableCell>
                      <TableCell className='hidden lg:table-cell'>{product.supplier_name || getSupplierName(product.supplier)}</TableCell>
                      <TableCell className='hidden md:table-cell'>{product.quantity.toLocaleString()}</TableCell>
                      <TableCell className='hidden lg:table-cell'>${product.price.toLocaleString()}</TableCell>
                      <TableCell className='hidden sm:table-cell'>
                        <span
                          className={`
                            flex items-center w-fit px-3 py-1 rounded-full text-white text-xs font-medium
                            ${stockLevel.level === 'Critical' ? 'bg-red-600' : ''}
                            ${stockLevel.level === 'Low' ? 'bg-orange-500' : ''}
                            ${stockLevel.level === 'Good' ? 'bg-green-600' : ''}
                          `}
                        >
                          {stockLevel.level === 'Critical' && <AlertTriangle className="w-4 h-4 mr-1" />}
                          {stockLevel.level === 'Low' && <AlertCircle className="w-4 h-4 mr-1" />}
                          {stockLevel.level === 'Good' && <CheckCircle className="w-4 h-4 mr-1" />}
                          {stockLevel.level}
                        </span>
                      </TableCell>



                      {canViewRevenue && (
                        <TableCell className='hidden lg:table-cell'>{getItemsSold(product.id).toLocaleString()}</TableCell>
                      )}
                      {canViewRevenue && (
                        <TableCell className='hidden lg:table-cell'>${getProductRevenue(product.id).toLocaleString()}</TableCell>
                      )}
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProduct(product)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canEdit && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {filteredAndSortedProducts.length > 0 && (
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedProducts.length)} of {filteredAndSortedProducts.length} results
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
          </div>
        </CardContent>
      </Card>

      {/* View Product Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.productDetails}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t.name}</Label>
                  <p className="text-foreground font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <Label>{t.category}</Label>
                  <p className="text-foreground font-medium">{selectedProduct.category}</p>
                </div>
                <div>
                  <Label>{t.supplier}</Label>
                  <p className="text-foreground font-medium">{selectedProduct.supplier_name || getSupplierName(selectedProduct.supplier)}</p>
                </div>
                <div>
                  <Label>{t.price}</Label>
                  <p className="text-foreground font-medium">${selectedProduct.price.toLocaleString()}</p>
                </div>
                <div>
                  <Label>{t.inStock}</Label>
                  <p className="text-foreground font-medium">{selectedProduct.quantity.toLocaleString()}</p>
                </div>
                <div>
                  <Label>{t.status}</Label><br />
                  <div
                    // Use dynamic classes:
                    className={`
                      inline-flex items-center px-3 py-1 rounded-full text-white text-xs font-medium
                      ${getStockLevel(selectedProduct.quantity).level === 'Critical' ? 'bg-red-700' : ''}
                      ${getStockLevel(selectedProduct.quantity).level === 'Low' ? 'bg-orange-500' : ''}
                      ${getStockLevel(selectedProduct.quantity).level === 'Good' ? 'bg-green-600' : ''}
                    `}
                  >
                    {getStockLevel(selectedProduct.quantity).level === 'Critical' && <AlertTriangle className="w-4 h-4 mr-1" />}
                    {getStockLevel(selectedProduct.quantity).level === 'Low' && <AlertCircle className="w-4 h-4 mr-1" />}
                    {getStockLevel(selectedProduct.quantity).level === 'Good' && <CheckCircle className="w-4 h-4 mr-1" />}
                    {getStockLevel(selectedProduct.quantity).level}
                  </div>

                </div>
                {canViewRevenue && (
                  <div>
                    <Label>{t.itemsSold}</Label>
                    <p className="text-foreground font-medium">{getItemsSold(selectedProduct.id).toLocaleString()}</p>
                  </div>
                )}
                {canViewRevenue && (
                  <div>
                    <Label>{t.totalRevenue}</Label>
                    <p className="text-foreground font-medium text-lg">
                      ${getProductRevenue(selectedProduct.id).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              {selectedProduct.description && (
                <div>
                  <Label>{t.description}</Label>
                  <p className="text-muted-foreground">{selectedProduct.description}</p>
                </div>
              )}
              {selectedProduct.created_at && (
                <div className="border-t pt-4">
                  <Label>Added On</Label>
                  <p className="text-muted-foreground">
                    {new Date(selectedProduct.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.editProduct}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="edit-name">{t.productName}</Label>
              <Input
                id="edit-name"
                value={editProduct.name}
                onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">{t.category}</Label>
              <Select value={editProduct.category} onValueChange={(value) => setEditProduct({ ...editProduct, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                  {categories.filter(cat => !['Electronics', 'Furniture', 'Office Supplies'].includes(cat)).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-supplier">{t.supplier}</Label>
              <Select value={editProduct.supplier} onValueChange={(value) => setEditProduct({ ...editProduct, supplier: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-price">{t.price} ($)</Label>
              <Input
                id="edit-price"
                type="number"
                value={editProduct.price}
                onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-quantity">{t.quantityInStock}</Label>
              <Input
                id="edit-quantity"
                type="number"
                value={editProduct.quantity}
                onChange={(e) => setEditProduct({ ...editProduct, quantity: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-minStock">{t.minimumStockLevel}</Label>
              <Input
                id="edit-minStock"
                type="number"
                value={editProduct.minStock}
                onChange={(e) => setEditProduct({ ...editProduct, minStock: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-description">{t.description}</Label>
              <Textarea
                id="edit-description"
                value={editProduct.description}
                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>{t.cancel}</Button>
            <Button onClick={async () => {
              try {
                if (!selectedProduct) return;

                const productData = {
                  name: editProduct.name,
                  category: editProduct.category,
                  supplier: parseInt(editProduct.supplier),
                  price: parseFloat(editProduct.price),
                  quantity: parseInt(editProduct.quantity),
                  min_stock: editProduct.minStock ? parseInt(editProduct.minStock) : 10,
                  description: editProduct.description
                };

                await productsAPI.update(selectedProduct.id, productData);
                await fetchData(); // Refresh the product list
                setIsEditModalOpen(false);
              } catch (error) {
                console.error('Error updating product:', error);
              }
            }}>{t.edit}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Insights */}
      <AIInsights 
        data={{
          totalProducts: products.length,
          displayedProducts: filteredAndSortedProducts.length,
          lowStockCount: products.filter(p => p.quantity < 10).length,
          selectedCategory: categoryFilter,
          searchTerm: searchTerm
        }} 
        pageType="products" 
      />
    </motion.div>
  );
};

export default Products;