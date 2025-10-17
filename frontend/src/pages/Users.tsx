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
  Copy,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown
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
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AIInsightsSection from '@/components/shared/AIInsightsSection';
import { usersAPI, ordersAPI, productsAPI } from '@/lib/api';

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

interface UserFormData {
  name: string;
  email: string;
  role: string;
  phone: string;
  password?: string;
  status?: string;
}

interface EditUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (userData: UserFormData) => void;
}

interface AddUserModalProps {
  onAddUser: (userData: UserFormData) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onUpdate }) => {
  const { t } = useLanguage();
  const [userData, setUserData] = useState<UserFormData>({
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
    } else {
      alert('Please fill in all required fields');
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
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const fetchUsers = async () => {
    try {
      // Fetch data from APIs
      const [userData, ordersData, productsData] = await Promise.all([
        usersAPI.getAll(),
        ordersAPI.getAll(),
        productsAPI.getAll()
      ]);

      const userList = userData.results || userData;
      const orderList = ordersData.results || ordersData;
      const productList = productsData.results || productsData;

      // Store orders and products in state
      setOrders(orderList);
      setProducts(productList);

      // Calculate orders and revenue for each user
      const enrichedUsers = userList.map(user => {
        // Get all orders for this user
        const userOrders = orderList.filter(order => order.user === user.id);

        // Calculate total orders
        const totalOrders = userOrders.length;

        // Calculate total revenue
        const totalRevenue = userOrders.reduce((sum, order) => {
          if (order.total_price) return sum + parseFloat(order.total_price);
          const product = productList.find(p => p.id === order.product);
          const price = product ? parseFloat(product.price) : 0;
          return sum + (price * order.quantity);
        }, 0);

        return {
          ...user,
          profilePic: user.profile_pic || `https://randomuser.me/api/portraits/${user.first_name === 'Alice' || user.first_name === 'Diana' ? 'women' : 'men'}/1.jpg`,
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

  // Filter, sort and paginate users
  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
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
        case 'orders':
          aValue = a.orders;
          bValue = b.orders;
          break;
        case 'revenue':
          aValue = a.revenue;
          bValue = b.revenue;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, pageSize]);

  // Update filteredUsers for backward compatibility
  useEffect(() => {
    setFilteredUsers(filteredAndSortedUsers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchTerm, roleFilter, sortField, sortDirection]);

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

  const handleAddUser = async (userData: UserFormData) => {
    try {
      // Parse the name to first_name and last_name
      const nameParts = userData.name.split(' ');
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';

      const userPayload = {
        username: userData.email.split('@')[0], // Use email prefix as username
        first_name,
        last_name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        phone: userData.phone || null,
        profile_pic: null
      };

      await usersAPI.create(userPayload);
      await fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user. Please try again.');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleUpdateUser = async (updatedUser: UserFormData) => {
    try {
      if (!selectedUser) return;

      // Parse the name to first_name and last_name
      const nameParts = updatedUser.name.split(' ');
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';

      const userPayload = {
        username: selectedUser.username, // Keep existing username
        first_name,
        last_name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone || null,
        profile_pic: selectedUser.profile_pic
      };

      await usersAPI.update(selectedUser.id, userPayload);
      await fetchUsers(); // Refresh the user list
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await usersAPI.delete(userId);
        await fetchUsers(); // Refresh the user list
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
      }
    }
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
      className="p-6 space-y-6"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium">{t.employees}</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'Employee').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t.staffMembers}
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
              />
              <YAxis
                allowDecimals={false}
                label={{
                  value: "Count",
                  angle: -90,
                  position: "insideLeft",
                  offset: 10,
                }}
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

          {/* User Directory Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center justify-between w-full hover:text-primary transition-colors"
                  >
                    <span>{t.name}</span>
                    {getSortIcon('name')}
                  </button>
                </TableHead>
                <TableHead>{t.role}</TableHead>
                <TableHead className="hidden lg:table-cell">{t.contact}</TableHead>
                <TableHead className="hidden md:table-cell">
                  <button
                    onClick={() => handleSort('orders')}
                    className="flex items-center justify-between w-full hover:text-primary transition-colors"
                  >
                    <span>Orders</span>
                    {getSortIcon('orders')}
                  </button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <button
                    onClick={() => handleSort('revenue')}
                    className="flex items-center justify-between w-full hover:text-primary transition-colors"
                  >
                    <span>Revenue</span>
                    {getSortIcon('revenue')}
                  </button>
                </TableHead>
                {canEditUsers && <TableHead className="text-right">{t.actions}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{getMedal(startIndex + index + 1)}</TableCell>
                  <TableCell className="flex items-center space-x-3">
                    <img
                      src={user.profilePic || `https://randomuser.me/api/portraits/${user.first_name === 'Alice' || user.first_name === 'Diana' ? 'women' : 'men'}/1.jpg`}
                      alt={user.name || user.username}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://randomuser.me/api/portraits/men/1.jpg';
                      }}
                    />
                    <div>
                      <div className="font-medium text-foreground">{user.name || user.username}</div>
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
                        {user.phone || 'No phone'}
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteUser(user.id)}
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

          {/* Pagination Controls */}
          {filteredAndSortedUsers.length > 0 && (
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
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length} results
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

          {filteredAndSortedUsers.length === 0 && (
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
      <AIInsightsSection 
        data={{
          users: filteredAndSortedUsers,
          totalUsers: users.length,
          displayedUsers: filteredAndSortedUsers.length,
          selectedRole: roleFilter,
          searchTerm: searchTerm,
          roleDistribution: {
            Admin: users.filter(u => u.role === 'Admin').length,
            Manager: users.filter(u => u.role === 'Manager').length,
            Employee: users.filter(u => u.role === 'Employee').length,
          },
          orders: orders,
          products: products,
          userOrders: orders.reduce((acc, order) => {
            const userId = order.user;
            acc[userId] = (acc[userId] || 0) + 1;
            return acc;
          }, {} as Record<number, number>)
        }} 
        pageType="users" 
      />

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
                  src={selectedUser.profilePic || `https://randomuser.me/api/portraits/${selectedUser.first_name === 'Alice' || selectedUser.first_name === 'Diana' ? 'women' : 'men'}/1.jpg`}
                  alt={selectedUser.name || selectedUser.username}
                  className="w-16 h-16 rounded-full object-cover border-4 border-border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://randomuser.me/api/portraits/men/1.jpg';
                  }}
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-foreground">{selectedUser.name || selectedUser.username}</h3>
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
                      <p className="text-sm text-muted-foreground">{selectedUser.phone || 'No phone number'}</p>
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