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
import { Badge } from '@/components/ui/badge';
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
  Filter, AlertCircle, CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AIInsights from '@/components/shared/AIInsights';

interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplierId: number;
  minStock?: number;
  description?: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface Order {
  id: number;
  productId: number;
  userId: number;
  quantity: number;
  status: string;
}

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
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
      const [productsRes, suppliersRes, ordersRes] = await Promise.all([
        fetch('/data/products.json'),
        fetch('/data/suppliers.json'),
        fetch('/data/orders.json')
      ]);

      const [productsData, suppliersData, ordersData] = await Promise.all([
        productsRes.json(),
        suppliersRes.json(),
        ordersRes.json()
      ]);

      setProducts(productsData);
      setSuppliers(suppliersData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [...new Set(products.map(p => p.category))];
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);


  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesSupplier = supplierFilter === 'all' || product.supplierId.toString() === supplierFilter;
    const matchesStock = stockFilter === 'all' ||
      (stockFilter === 'low' && product.quantity < 50) ||
      (stockFilter === 'sufficient' && product.quantity >= 50);

    return matchesSearch && matchesCategory && matchesSupplier && matchesStock;
  });

  const getSupplierName = (supplierId: number) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier?.name || 'Unknown';
  };

  const getItemsSold = (productId: number) => {
    return orders
      .filter(order => order.productId === productId && (order.status === 'Delivered'))
      .reduce((total, order) => total + order.quantity, 0);
  };

  const getProductRevenue = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    const itemsSold = getItemsSold(productId);
    return itemsSold * product.price;
  };


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

  const handleAddProduct = () => {
    console.log('Adding product:', addProduct);
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
      supplier: product.supplierId.toString(),
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      minStock: product.minStock?.toString() || '',
      description: product.description || ''
    });
    setIsEditModalOpen(true);
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
        <span className="ml-3 text-muted-foreground">Loading products...</span>
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
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product inventory and track stock levels
          </p>
        </div>

        {canEdit && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={addProduct.name}
                    onChange={(e) => setAddProduct({ ...addProduct, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={addProduct.category} onValueChange={(value) => setAddProduct({ ...addProduct, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Select value={addProduct.supplier} onValueChange={(value) => setAddProduct({ ...addProduct, supplier: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
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
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={addProduct.price}
                    onChange={(e) => setAddProduct({ ...addProduct, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity in Stock</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={addProduct.quantity}
                    onChange={(e) => setAddProduct({ ...addProduct, quantity: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="minStock">Minimum Stock Level</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={addProduct.minStock}
                    onChange={(e) => setAddProduct({ ...addProduct, minStock: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={addProduct.description}
                    onChange={(e) => setAddProduct({ ...addProduct, description: e.target.value })}
                    placeholder="Product description..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button onClick={handleAddProduct}>Add Product</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="border-0 dark:border shadow-lg flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>

        {canViewRevenue && (
          <Card className="border-0 dark:border shadow-lg flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${getTotalRevenue().toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From product sales</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 dark:border shadow-lg flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.quantity < 50).length}
            </div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card className="border-0 dark:border shadow-lg flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Product categories</p>
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
              <span>Inventory Levels</span>
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
                    value: "Products",
                    position: "insideBottom",
                    offset: -5
                  }}
                  tick={false}
                />
                <YAxis
                  allowDecimals={false}
                  label={{
                    value: "Stock Level",
                    angle: -90,
                    position: "insideLeft",
                    offset: 10,
                    fill: 'hsl(var(--muted-foreground))'
                  }}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <CartesianGrid strokeDasharray="5 5" stroke="hsl(var(--border))" vertical={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  content={() => (
                    <div className="flex justify-center gap-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: 'hsl(0 84% 60% / 0.8)' }}></div>
                        <span className="text-sm text-muted-foreground">Critical (&lt; 20)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: 'hsl(38 92% 50% / 0.8)' }}></div>
                        <span className="text-sm text-muted-foreground">Low (20-50)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: 'hsl(217 91% 60% / 0.8)' }}></div>
                        <span className="text-sm text-muted-foreground">Sufficient (≥50)</span>
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
                <span>Revenue per Product</span>
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
                      value: "Products",
                      position: "insideBottom",
                      offset: -5
                    }}
                    tick={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    label={{
                      value: "Revenue ($)",
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                      fill: 'hsl(var(--muted-foreground))'
                    }}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    content={() => (
                      <div className="flex justify-center gap-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: 'hsl(142 76% 46% / 0.8)' }}></div>
                          <span className="text-sm text-muted-foreground">Revenue</span>
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
          <CardTitle>Product Inventory ({filteredProducts.length} products)</CardTitle>
        </CardHeader>
        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            {/* Simple Filter */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-2 md:mt-0"
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
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Supplier Filter */}
                <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="All Suppliers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
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
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="sufficient">Sufficient Stock</SelectItem>
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
                  <TableHead>Product</TableHead>
                  <TableHead className='hidden md:table-cell'>Category</TableHead>
                  <TableHead className='hidden lg:table-cell'>Supplier</TableHead>
                  <TableHead className='hidden md:table-cell'>Quantity</TableHead>
                  <TableHead className='hidden lg:table-cell'>Price</TableHead>
                  <TableHead className='hidden sm:table-cell'>Stock Level</TableHead>
                  {canViewRevenue && <TableHead className='hidden lg:table-cell'>Sold</TableHead>}
                  {canViewRevenue && <TableHead className='hidden lg:table-cell'>Revenue</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockLevel = getStockLevel(product.quantity);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className='hidden md:table-cell'>{product.category}</TableCell>
                      <TableCell className='hidden lg:table-cell'>{getSupplierName(product.supplierId)}</TableCell>
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
          </div>
        </CardContent>
      </Card>

      {/* View Product Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-foreground font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="text-foreground font-medium">{selectedProduct.category}</p>
                </div>
                <div>
                  <Label>Supplier</Label>
                  <p className="text-foreground font-medium">{getSupplierName(selectedProduct.supplierId)}</p>
                </div>
                <div>
                  <Label>Price</Label>
                  <p className="text-foreground font-medium">${selectedProduct.price.toLocaleString()}</p>
                </div>
                <div>
                  <Label>In Stock</Label>
                  <p className="text-foreground font-medium">{selectedProduct.quantity.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Status</Label><br />
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
                    <Label>Items Sold</Label>
                    <p className="text-foreground font-medium">{getItemsSold(selectedProduct.id).toLocaleString()}</p>
                  </div>
                )}
                {canViewRevenue && (
                  <div>
                    <Label>Total Revenue</Label>
                    <p className="text-foreground font-medium text-lg">
                      ${getProductRevenue(selectedProduct.id).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              {selectedProduct.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-muted-foreground">{selectedProduct.description}</p>
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
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                value={editProduct.name}
                onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={editProduct.category} onValueChange={(value) => setEditProduct({ ...editProduct, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-supplier">Supplier</Label>
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
              <Label htmlFor="edit-price">Price ($)</Label>
              <Input
                id="edit-price"
                type="number"
                value={editProduct.price}
                onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-quantity">Quantity in Stock</Label>
              <Input
                id="edit-quantity"
                type="number"
                value={editProduct.quantity}
                onChange={(e) => setEditProduct({ ...editProduct, quantity: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-minStock">Minimum Stock Level</Label>
              <Input
                id="edit-minStock"
                type="number"
                value={editProduct.minStock}
                onChange={(e) => setEditProduct({ ...editProduct, minStock: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editProduct.description}
                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              console.log('Updating product:', editProduct);
              setIsEditModalOpen(false);
            }}>Update Product</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Insights */}
      <AIInsights data={filteredProducts} pageType="products" />
    </motion.div>
  );
};

export default Products;