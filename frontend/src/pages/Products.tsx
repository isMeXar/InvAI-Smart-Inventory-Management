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
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  Package, 
  Plus, 
  Search, 
  // Filter, 
  Eye, 
  Edit, 
  Trash2, 
  TrendingUp,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AIInsights from '@/components/shared/AIInsights';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
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

  const getProductRevenue = (productId: number) => {
    const productOrders = orders.filter(o => o.productId === productId && o.status === 'Delivered');
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    return productOrders.reduce((total, order) => total + (order.quantity * product.price), 0);
  };

  const getStockLevel = (quantity: number) => {
    if (quantity < 30) return { level: 'Critical', color: 'destructive' };
    if (quantity < 50) return { level: 'Low', color: 'warning' };
    return { level: 'Good', color: 'success' };
  };

  const getTotalRevenue = () => {
    return products.reduce((total, product) => total + getProductRevenue(product.id), 0);
  };

  // Chart data for inventory levels with blue/red colors
  const inventoryChartData = {
    labels: products.map(p => p.name.split(' ').slice(0, 2).join(' ')),
    datasets: [{
      label: 'Stock Level',
      data: products.map(p => p.quantity),
      backgroundColor: products.map(p => {
        if (p.quantity < 30) return 'hsl(0 84% 60% / 0.8)'; // Red for critical
        if (p.quantity < 50) return 'hsl(38 92% 50% / 0.8)'; // Orange for low
        return 'hsl(217 91% 60% / 0.8)'; // Blue for sufficient
      }),
      borderColor: products.map(p => {
        if (p.quantity < 30) return 'hsl(0 84% 60%)';
        if (p.quantity < 50) return 'hsl(38 92% 50%)';
        return 'hsl(217 91% 60%)';
      }),
      borderWidth: 2
    }]
  };

  // Chart data for revenue per product - Bar chart instead of line
  const revenueChartData = {
    labels: products.map(p => p.name.split(' ').slice(0, 2).join(' ')),
    datasets: [{
      label: 'Revenue ($)',
      data: products.map(p => getProductRevenue(p.id)),
      backgroundColor: 'hsl(142 76% 46% / 0.8)',
      borderColor: 'hsl(142 76% 46%)',
      borderWidth: 2
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: {
        backgroundColor: 'hsl(var(--popover))',
        borderColor: 'hsl(var(--border))',
        titleColor: 'hsl(var(--popover-foreground))',
        bodyColor: 'hsl(var(--popover-foreground))',
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          color: 'hsl(var(--muted-foreground))'
        },
        // grid: { color: 'hsl(var(--border))' }
      },
      y: {
        beginAtZero: true,
        ticks: { color: 'hsl(var(--muted-foreground))' },
        // grid: { color: 'hsl(var(--border))' }
      }
    }
  };

  const handleAddProduct = () => {
    console.log('Adding product:', newProduct);
    setIsAddModalOpen(false);
    setNewProduct({
      name: '', category: '', supplier: '', price: '', quantity: '', minStock: '', description: ''
    });
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setNewProduct({
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
      <div className="flex justify-between items-center">
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
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
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
                  <Select value={newProduct.supplier} onValueChange={(value) => setNewProduct({...newProduct, supplier: value})}>
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
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity in Stock</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="minStock">Minimum Stock Level</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={newProduct.minStock}
                    onChange={(e) => setNewProduct({...newProduct, minStock: e.target.value})}
                    placeholder="0"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
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
        <Card className="border-0 shadow-lg flex-1">
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
          <Card className="border-0 shadow-lg flex-1">
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

        <Card className="border-0 shadow-lg flex-1">
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

        <Card className="border-0 shadow-lg flex-1">
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
      <div className="flex flex-col md:flex-row gap-6">
        {/* Inventory Levels Chart */}
        <Card className="border-0 shadow-lg flex-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <span>Inventory Levels</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={inventoryChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Revenue per Product Chart (Admin/Manager only) */}
        {canViewRevenue && (
          <Card className="border-0 shadow-lg flex-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <span>Revenue per Product</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar data={revenueChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Products Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Product Inventory ({filteredProducts.length} products)</CardTitle>
        </CardHeader>
        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Search Products</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    className="pl-10"
                    placeholder="Search by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category-filter">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="supplier-filter">Supplier</Label>
                <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All suppliers" />
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
              </div>
              <div>
                <Label htmlFor="stock-filter">Stock Level</Label>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="sufficient">Sufficient Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock Level</TableHead>
                  {canViewRevenue && <TableHead>Revenue</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockLevel = getStockLevel(product.quantity);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{getSupplierName(product.supplierId)}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>
                        <Badge variant={stockLevel.color as any} className="flex items-center w-fit">
                          {product.quantity < 30 && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {stockLevel.level}
                        </Badge>
                      </TableCell>
                      {canViewRevenue && (
                        <TableCell>${getProductRevenue(product.id).toLocaleString()}</TableCell>
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
                  <Label>Product Name</Label>
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
                  <p className="text-foreground font-medium">${selectedProduct.price}</p>
                </div>
                <div>
                  <Label>Quantity in Stock</Label>
                  <p className="text-foreground font-medium">{selectedProduct.quantity}</p>
                </div>
                <div>
                  <Label>Stock Status</Label>
                  <Badge variant={getStockLevel(selectedProduct.quantity).color as any}>
                    {getStockLevel(selectedProduct.quantity).level}
                  </Badge>
                </div>
              </div>
              {selectedProduct.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-muted-foreground">{selectedProduct.description}</p>
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
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
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
              <Select value={newProduct.supplier} onValueChange={(value) => setNewProduct({...newProduct, supplier: value})}>
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
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-quantity">Quantity in Stock</Label>
              <Input
                id="edit-quantity"
                type="number"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="edit-minStock">Minimum Stock Level</Label>
              <Input
                id="edit-minStock"
                type="number"
                value={newProduct.minStock}
                onChange={(e) => setNewProduct({...newProduct, minStock: e.target.value})}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              console.log('Updating product:', newProduct);
              setIsEditModalOpen(false);
            }}>Update Product</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Insights */}
      <AIInsights data={filteredProducts} pageType="products"/>
    </motion.div>
  );
};

export default Products;