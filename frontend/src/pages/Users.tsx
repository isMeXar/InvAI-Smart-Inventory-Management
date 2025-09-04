import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users as UsersIcon, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Eye, 
  Mail, 
  Phone,
  Filter,
  Copy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AIInsights from '@/components/shared/AIInsights';

interface User {
  id: number;
  name: string;
  role: 'Admin' | 'Manager' | 'Employee';
  email: string;
  phone: string;
  profilePic: string;
  orders: number;
  revenue: number;
}

interface Order {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
}

interface Product {
  id: number;
  price: number;
}

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (userData: any) => void;
}

interface AddUserModalProps {
  onAddUser: (userData: any) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const { t } = useLanguage();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      });
    }
  }, [user]);

  const handleSubmit = () => {
    if (userData.name && userData.email && userData.role) {
      onUpdate({ ...user, ...userData });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.edit} User</DialogTitle>
        </DialogHeader>
        {user ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                value={userData.name}
                onChange={(e) => setUserData({...userData, name: e.target.value})}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({...userData, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t.role}</Label>
              <Select value={userData.role} onValueChange={(value) => setUserData({...userData, role: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t.phone}</Label>
              <Input
                id="phone"
                value={userData.phone}
                onChange={(e) => setUserData({...userData, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-muted-foreground">No user selected</p>
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button onClick={handleSubmit}>
            {t.save} Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AddUserModal: React.FC<AddUserModalProps> = ({ onAddUser, isOpen, onOpenChange }) => {
  const { t } = useLanguage();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    phone: '',
    status: 'Active'
  });

  const handleSubmit = () => {
    if (userData.name && userData.email && userData.role && userData.password) {
      onAddUser(userData);
      setUserData({
        name: '',
        email: '',
        role: '',
        password: '',
        phone: '',
        status: 'Active'
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          {t.addUser}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.addUser}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.name}</Label>
            <Input
              id="name"
              value={userData.name}
              onChange={(e) => setUserData({...userData, name: e.target.value})}
              placeholder="Enter full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({...userData, email: e.target.value})}
              placeholder="Enter email address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">{t.role}</Label>
            <Select value={userData.role} onValueChange={(value) => setUserData({...userData, role: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={userData.password}
              onChange={(e) => setUserData({...userData, password: e.target.value})}
              placeholder="Enter password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t.phone}</Label>
            <Input
              id="phone"
              value={userData.phone}
              onChange={(e) => setUserData({...userData, phone: e.target.value})}
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">{t.status}</Label>
            <Select value={userData.status} onValueChange={(value) => setUserData({...userData, status: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button onClick={handleSubmit}>
            {t.add} User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Users = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      // Fetch users
      const userResponse = await fetch('/data/users.json');
      const userData: User[] = await userResponse.json();

      // Fetch orders
      const orderResponse = await fetch('/data/orders.json');
      const orders: Order[] = await orderResponse.json();

      // Fetch products
      const productResponse = await fetch('/data/products.json');
      const products: Product[] = await productResponse.json();

      // Calculate orders and revenue for each user
      const enrichedUsers = userData.map(user => {
        // Get all orders for this user
        const userOrders = orders.filter(order => order.userId === user.id);
        
        // Calculate total orders
        const totalOrders = userOrders.length;

        // Calculate total revenue
        const totalRevenue = userOrders.reduce((sum, order) => {
          const product = products.find(p => p.id === order.productId);
          const price = product ? product.price : 0;
          return sum + (price * order.quantity);
        }, 0);

        return {
          ...user,
          orders: totalOrders,
          revenue: totalRevenue
        };
      });

      // Sort by orders (descending), then revenue (descending)
      setUsers(enrichedUsers.sort((a, b) => 
        b.orders - a.orders || b.revenue - a.revenue
      ));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Maintain sorting for filtered users (top 10)
    setFilteredUsers(filtered.sort((a, b) => 
      b.orders - a.orders || b.revenue - a.revenue
    ).slice(0, 10));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-destructive text-destructive-foreground';
      case 'Manager':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getUsersByRoleData = () => {
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(roleCounts).map(([role, count]) => ({
      role,
      count,
      fill: role === 'Admin' ? 'hsl(var(--destructive))' : 
            role === 'Manager' ? 'hsl(var(--warning))' : 
            'hsl(var(--primary))'
    }));
  };

  const canEditUsers = user?.role === 'Admin' || user?.role === 'Manager';

  const handleAddUser = (userData: any) => {
    const newUser = {
      ...userData,
      id: users.length + 1,
      profilePic: '/placeholder.svg',
      orders: 0,
      revenue: 0
    };
    setUsers([...users, newUser].sort((a, b) => 
      b.orders - a.orders || b.revenue - a.revenue
    ));
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleUpdateUser = (updatedUser: any) => {
    setUsers(users.map(user => user.id === updatedUser.id ? { ...user, ...updatedUser } : user)
      .sort((a, b) => b.orders - a.orders || b.revenue - a.revenue));
    setIsEditModalOpen(false);
  };

  const getMedal = (rank: number) => {
    return (
      <span className="inline-block w-8 text-center">
        {rank === 1 && <span className="text-2xl">🥇</span>}
        {rank === 2 && <span className="text-2xl">🥈</span>}
        {rank === 3 && <span className="text-2xl">🥉</span>}
        {rank > 3 && <span>{rank}</span>}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-muted-foreground">{t.loading}...</span>
      </div>
    );
  }

  if (user?.role !== 'Admin') {
    return (
      <div className="p-6">
        <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <CardContent className="text-center py-12">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">{t.accessDenied}</h2>
            <p className="text-muted-foreground">
              {t.onlyAdministrators}
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
      className="p-6 space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.userManagement}</h1>
          <p className="text-muted-foreground mt-1">
            {t.manageUserAccounts}
          </p>
        </div>
        {canEditUsers && (
          <AddUserModal onAddUser={handleAddUser} isOpen={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
        )}
      </div>

      {/* Stats Cards */}
      <div className="flex flex-col md:flex-row gap-4 space-y-3 md:space-y-0">
        <Card className='border-0 dark:border shadow-lg flex-1'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.totalUsers}</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {t.activeSystemUsers}
            </p>
          </CardContent>
        </Card>

        <Card className='border-0 dark:border shadow-lg flex-1'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.administrators}</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'Admin').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t.systemAdministrators}
            </p>
          </CardContent>
        </Card>

        <Card className='border-0 dark:border shadow-lg flex-1'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.managers}</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'Manager').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t.departmentManagers}
            </p>
          </CardContent>
        </Card>

        <Card className='border-0 dark:border shadow-lg flex-1'>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.managers}</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'Employee').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t.departmentManagers}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border-0 dark:border shadow-lg">
        <CardHeader>
          <CardTitle>{t.usersByRole}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getUsersByRoleData()}>
              <XAxis 
                dataKey="role" 
                angle={-45} 
                textAnchor="end" 
                interval={0} // ensures all labels show
                height={70} // give extra space so labels don’t get cut
              />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))', // adapts to your theme colors
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                }}
                labelStyle={{color: 'hsl(var(--foreground))'}}
                itemStyle={{color: 'hsl(var(--foreground))'}}
              />

              <Bar dataKey="count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Directory (Leaderboard) */}
      <Card className="border-0 dark:border shadow-lg">
        <CardHeader>
          <CardTitle>Top Users by Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.searchUsers}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t.filterByRole} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allRoles}</SelectItem>
                <SelectItem value="Admin">{t.admin}</SelectItem>
                <SelectItem value="Manager">{t.manager}</SelectItem>
                <SelectItem value="Employee">{t.employee}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Directory Table (Leaderboard) */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>{t.name}</TableHead>
                <TableHead>{t.role}</TableHead>
                <TableHead className="hidden lg:table-cell">{t.contact}</TableHead>
                <TableHead className="hidden md:table-cell">Orders</TableHead>
                <TableHead className="hidden md:table-cell">Revenue</TableHead>
                {canEditUsers && <TableHead className="text-right">{t.actions}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.slice(0, 10).map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{getMedal(index + 1)}</TableCell>
                  <TableCell className="flex items-center space-x-3">
                    <img
                      src={user.profilePic}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-foreground">{user.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                        {user.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{user.orders.toLocaleString()}</TableCell>
                  <TableCell className="hidden md:table-cell">${user.revenue.toLocaleString()}</TableCell>
                  {canEditUsers && (
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewUser(user)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t.userNotFound}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateUser}
        />
      )}

      {/* AI Insights */}
      <AIInsights data={users} pageType="users" />

      {/* View User Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.view} User Details</DialogTitle>
          </DialogHeader>
          {selectedUser ? (
            <div className="py-4 space-y-6">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedUser.profilePic}
                  alt={selectedUser.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-border"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-foreground">{selectedUser.name}</h3>
                    <Badge className={getRoleColor(selectedUser.role)}>{selectedUser.role}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">ID: {selectedUser.id}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-muted rounded-lg">
                  <div className="flex items-center justify-between space-x-3 p-3 bg-muted rounded-lg">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.email}</p>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    </div>
                  </div>
                  <Button
                    className="mx-2 hover:bg-blue-500 dark:hover:text-black"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(selectedUser.email)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between bg-muted rounded-lg">
                  <div className="flex items-center justify-between space-x-3 p-3 bg-muted rounded-lg">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{t.phone}</p>
                      <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                    </div>
                  </div>
                  <Button
                    className="mx-2 hover:bg-blue-500 dark:hover:text-black"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(selectedUser.phone)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 p-3 bg-muted rounded-lg flex flex-col items-center">
                    <p className="text-sm text-muted-foreground">Orders</p>
                    <p className="text-lg font-bold text-foreground">{selectedUser.orders.toLocaleString()}</p>
                  </div>
                  <div className="flex-1 p-3 bg-muted rounded-lg flex flex-col items-center">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-lg font-bold text-foreground">${selectedUser.revenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-muted-foreground">No user selected</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Users;