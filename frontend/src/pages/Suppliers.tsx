import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Package2,
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  TrendingUp,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AIInsights from '@/components/shared/AIInsights';

interface Supplier {
  id: number;
  name: string;
  contact: string;
  phone: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplierId: number;
}

const Suppliers = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    phone: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [suppliersRes, productsRes] = await Promise.all([
        fetch('/data/suppliers.json'),
        fetch('/data/products.json')
      ]);
      const suppliersData = await suppliersRes.json();
      const productsData = await productsRes.json();
      setSuppliers(suppliersData);
      setProducts(productsData);
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

  const getProductsBySupplier = (supplierId: number) => {
    return products.filter(product => product.supplierId === supplierId);
  };

  const getSupplierRevenue = (supplierId: number) => {
    const supplierProducts = getProductsBySupplier(supplierId);
    return supplierProducts.reduce((total, product) => total + (product.price * Math.floor(product.quantity * 0.1)), 0);
  };

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
      name: supplier.name.length > 10 ? supplier.name.substring(0, 10) + '...' : supplier.name,
      revenue: getSupplierRevenue(supplier.id),
      fill: 'hsl(var(--primary))'
    }));
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
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
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
                <Button onClick={() => {
                  console.log('Adding supplier:', newSupplier);
                  setIsAddModalOpen(false);
                  setNewSupplier({
                    name: '',
                    contact: '',
                    phone: ''
                  });
                }}>{t.addSupplier}</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="flex flex-col md:flex-row gap-6">
        <Card className='flex-1'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalSuppliers}</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">
              {t.activeSuppliers}
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalProducts}</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              {t.suppliedProducts}
            </p>
          </CardContent>
        </Card>
        {canViewRevenue && (
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.revenue}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
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
              <span>{t.productsBySupplier}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={supplierDistributionData}
                  cx="40%"
                  cy="50%"
                  outerRadius={100}
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
                    <span className="text-sm text-muted-foreground">{value}</span>
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
                      fill: 'hsl(var(--foreground))'}}
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
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const revenue = payload[0].value;
                        return (
                          <div className="p-2 rounded-md border bg-[hsl(var(--card))] shadow-md">
                            <p className="font-medium text-foreground">{label}</p>
                            <p className="text-muted-foreground text-sm">
                              {t.revenue}: ${revenue.toLocaleString()}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
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
                <TableHead>{t.supplier}</TableHead>
                <TableHead className='hidden sm:table-cell'>{t.contactInformation}</TableHead>
                <TableHead className='hidden md:table-cell'>{t.products}</TableHead>
                {canViewRevenue && <TableHead className='hidden lg:table-cell'>{t.revenue}</TableHead>}
                {canEditSuppliers && <TableHead className="text-right">{t.actions}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
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
                      {/* <span className="text-muted-foreground"> {t.products}</span> */}
                    </div>
                  </TableCell>
                  {canViewRevenue && (
                    <TableCell className='hidden lg:table-cell'>
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
                            setNewSupplier({
                              name: supplier.name,
                              contact: supplier.contact,
                              phone: supplier.phone
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
              ))}
            </TableBody>
          </Table>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-8">
              <Package2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.supplierNotFound}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <AIInsights data={suppliers} pageType="suppliers" />

      {/* View Supplier Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supplier Details</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label>{t.supplierName}</Label>
                  <p className="text-foreground font-medium">{selectedSupplier.name}</p>
                </div>
                <div>
                  <Label>{t.contactEmail}</Label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-foreground">{selectedSupplier.contact}</p>
                  </div>
                </div>
                <div>
                  <Label>{t.phoneNumber}</Label>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <p className="text-foreground">{selectedSupplier.phone}</p>
                  </div>
                </div>
                <div>
                  <Label>{t.products}</Label>
                  <p className="text-foreground font-medium">{getProductsBySupplier(selectedSupplier.id).length} products</p>
                </div>
                <div>
                  <Label>{t.revenue}</Label>
                  <p className="text-foreground font-medium">${getSupplierRevenue(selectedSupplier.id).toLocaleString()}</p>
                </div>
              </div>
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
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-contact">{t.contactEmail}</Label>
              <Input
                id="edit-contact"
                value={newSupplier.contact}
                onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">{t.phoneNumber}</Label>
              <Input
                id="edit-phone"
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>{t.cancel}</Button>
            <Button onClick={() => {
              console.log('Updating supplier:', newSupplier);
              setIsEditModalOpen(false);
            }}>{t.editSupplier}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Suppliers;