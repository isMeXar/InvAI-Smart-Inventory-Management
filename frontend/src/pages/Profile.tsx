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
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar
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
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(minMax);

interface Order {
  id: number;
  product: number;
  productId?: number;
  user: number;
  userId?: number;
  user_id?: number;
  quantity: number;
  status: 'Shipped' | 'Processing' | 'Delivered' | 'Pending' | 'Cancelled';
  date: string;
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

type ChartView = 'daily' | 'weekly' | 'monthly' | 'yearly';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [chartView, setChartView] = useState<ChartView>("monthly");
  const currentDate = dayjs(); // Use actual current date
  const [selectedRefDate, setSelectedRefDate] = useState<Dayjs | null>(getPeriodStart("monthly", currentDate));
  const [selectedYearRange, setSelectedYearRange] = useState<[Dayjs | null, Dayjs | null]>([currentDate.startOf('year'), currentDate.endOf('year')]);

  // Form states
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    profile_pic: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        profile_pic: user.profile_pic || ''
      });
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes, statsRes] = await Promise.all([
        fetch('http://localhost:8000/api/orders/', {
          credentials: 'include'
        }),
        fetch('http://localhost:8000/api/products/', {
          credentials: 'include'
        }),
        fetch('http://localhost:8000/api/auth/users/stats/', {
          credentials: 'include'
        })
      ]);

      if (ordersRes.ok && productsRes.ok) {
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        setOrders(ordersData.results || ordersData);
        setProducts(productsData.results || productsData);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setUserStats(statsData);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data if API is not available
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch('/data/orders.json'),
          fetch('/data/products.json')
        ]);
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();
        setOrders(ordersData);
        setProducts(productsData);
      } catch (fallbackError) {
        console.error('Error fetching fallback data:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/users/update_profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        setIsEditing(false);
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({
          ...prev,
          profile_pic: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getUserOrders = () => {
    if (!user?.id) return [];

    // Debug logging
    console.log('Current user:', user);
    console.log('All orders:', orders);

    // Try different user ID matching approaches
    const userOrders = orders.filter(order => {
      // Check various possible user ID formats
      return order.userId === user.id ||
             order.user_id === user.id ||
             order.user === user.id ||
             (typeof order.user === 'object' && order.user?.id === user.id);
    });

    console.log('Filtered user orders:', userOrders);
    return userOrders;
  };

  const getProduct = (order: Order) => {
    const productId = order.product || order.productId;
    return products.find(p => p.id === productId);
  };

  const getOrderValue = (order: Order) => {
    const product = getProduct(order);
    return product ? product.price * order.quantity : 0;
  };

  const getTotalSpent = () => {
    return getUserOrders().reduce((total, order) => total + getOrderValue(order), 0);
  };

  const getOrdersByCategory = () => {
    const userOrders = getUserOrders();
    const categoryData = userOrders.reduce((acc, order) => {
      const product = getProduct(order);
      if (product) {
        acc[product.category] = (acc[product.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryData).map(([category, count]) => ({
      category,
      count,
      percentage: userOrders.length ? Math.round((count / userOrders.length) * 100) : 0
    }));
  };

  function getPeriodStart(view: ChartView, date: Dayjs) {
    const start = date.startOf('day');
    if (view === "weekly") {
      return start.startOf('week');
    } else if (view === "monthly") {
      return start.startOf('year');
    } else if (view === "yearly") {
      return start.startOf('year');
    }
    return start;
  }

  function getPeriodEnd(view: ChartView, start: Dayjs) {
    if (view === "daily") {
      return start.endOf('day');
    } else if (view === "weekly") {
      return start.endOf('week');
    } else if (view === "monthly") {
      return start.endOf('year');
    } else if (view === "yearly") {
      return start.endOf('year');
    }
    return start;
  }

  function getPeriodLabel(view: ChartView, start: Dayjs, end?: Dayjs) {
    if (view === "daily") {
      return start.format('MMMM D, YYYY');
    } else if (view === "weekly") {
      const endDay = start.endOf('week');
      return `${start.format('MMMM D, YYYY')} - ${endDay.format('MMMM D, YYYY')}`;
    } else if (view === "monthly") {
      return start.format('YYYY');
    } else if (view === "yearly") {
      return `${start.format('YYYY')} - ${end!.format('YYYY')}`;
    }
    return "";
  }

  const handleSetChartView = (view: ChartView) => {
    if (view === "yearly") {
      setSelectedYearRange([currentDate.startOf('year'), currentDate.endOf('year')]);
    } else {
      setSelectedRefDate(getPeriodStart(view, currentDate));
    }
    setChartView(view);
  };

  const canGoNext = () => {
    let tempStart = selectedRefDate ? selectedRefDate.clone() : currentDate;
    let tempEnd: Dayjs;

    switch (chartView) {
      case 'yearly':
        const [start, end] = selectedYearRange;
        if (!start || !end) return false;
        tempStart = end.add(1, 'year');
        return tempStart <= currentDate;
      case 'daily':
        tempStart = tempStart.add(1, 'day');
        tempEnd = getPeriodEnd(chartView, tempStart);
        return tempEnd <= currentDate;
      case 'weekly':
        tempStart = tempStart.add(7, 'day');
        tempEnd = getPeriodEnd(chartView, tempStart);
        return tempEnd <= currentDate;
      case 'monthly':
        tempStart = tempStart.add(1, 'year');
        tempEnd = getPeriodEnd(chartView, tempStart);
        return tempStart <= currentDate;
      default:
        return false;
    }
  };

  const goPrev = () => {
    if (chartView === "yearly") {
      const [start, end] = selectedYearRange;
      if (!start || !end) return;
      const rangeLength = end.year() - start.year() + 1;
      setSelectedYearRange([
        start.subtract(rangeLength, 'year').startOf('year'),
        end.subtract(rangeLength, 'year').endOf('year')
      ]);
    } else if (selectedRefDate) {
      let newStart = selectedRefDate.clone();
      if (chartView === "daily") {
        newStart = newStart.subtract(1, 'day');
      } else if (chartView === "weekly") {
        newStart = newStart.subtract(7, 'day');
      } else if (chartView === "monthly") {
        newStart = newStart.subtract(1, 'year');
      }
      setSelectedRefDate(newStart);
    }
  };

  const goNext = () => {
    if (!canGoNext()) return;
    if (chartView === "yearly") {
      const [start, end] = selectedYearRange;
      if (!start || !end) return;
      const rangeLength = end.year() - start.year() + 1;
      setSelectedYearRange([
        start.add(rangeLength, 'year').startOf('year'),
        end.add(rangeLength, 'year').endOf('year')
      ]);
    } else if (selectedRefDate) {
      let newStart = selectedRefDate.clone();
      if (chartView === "daily") {
        newStart = newStart.add(1, 'day');
      } else if (chartView === "weekly") {
        newStart = newStart.add(7, 'day');
      } else if (chartView === "monthly") {
        newStart = newStart.add(1, 'year');
      }
      setSelectedRefDate(newStart);
    }
  };

  const handleDateSelect = (date: Dayjs | null) => {
    if (date && date <= currentDate) {
      setSelectedRefDate(getPeriodStart(chartView, date));
    }
  };

  const handleYearRangeSelect = (index: number, date: Dayjs | null) => {
    if (date && date <= currentDate) {
      setSelectedYearRange(prev => {
        const newRange = [...prev] as [Dayjs | null, Dayjs | null];
        newRange[index] = date.startOf('year');
        if (index === 0 && newRange[1] && newRange[0]! > newRange[1]) {
          newRange[1] = newRange[0];
        } else if (index === 1 && newRange[0] && newRange[1]! < newRange[0]) {
          newRange[0] = newRange[1];
        }
        return newRange;
      });
    }
  };

  const minDate = useMemo(() => dayjs('2000-01-01'), []);

  const getOrderHistory = () => {
    // Use API data if available and matches current view
    if (userStats?.monthly_orders && chartView === "monthly" && selectedRefDate?.year() === currentDate.year()) {
      return userStats.monthly_orders;
    }

    // Fallback to calculated data from orders
    const userOrders = getUserOrders().map(order => ({
      ...order,
      parsedDate: dayjs(order.date)
    })).filter(o => o.parsedDate.isValid());
    const data: { period: string; orders: number }[] = [];

    if (chartView === "daily" && selectedRefDate) {
      for (let h = 0; h < 24; h++) {
        const hourStart = selectedRefDate.set('hour', h).set('minute', 0).set('second', 0).set('millisecond', 0);
        const hourEnd = hourStart.add(1, 'hour').subtract(1, 'millisecond');
        const effectiveEnd = dayjs.min(hourEnd, currentDate)!;
        const ordersCount = hourStart > currentDate ? 0 : userOrders.filter(o => o.parsedDate >= hourStart && o.parsedDate <= effectiveEnd).length;
        data.push({ period: `${h.toString().padStart(2, '0')}:00`, orders: ordersCount });
      }
    } else if (chartView === "weekly" && selectedRefDate) {
      const weekStart = selectedRefDate.startOf('week');
      for (let d = 0; d < 7; d++) {
        const dayStart = weekStart.add(d, 'day');
        const dayEnd = dayStart.endOf('day');
        const effectiveEnd = dayjs.min(dayEnd, currentDate)!;
        const ordersCount = dayStart > currentDate ? 0 : userOrders.filter(o => o.parsedDate >= dayStart && o.parsedDate <= effectiveEnd).length;
        data.push({ period: dayNames[d], orders: ordersCount });
      }
    } else if (chartView === "monthly" && selectedRefDate) {
      const year = selectedRefDate.year();
      for (let m = 0; m < 12; m++) {
        const monthStart = dayjs(new Date(year, m, 1));
        const monthEnd = monthStart.endOf('month');
        const ordersCount = userOrders.filter(o => o.parsedDate >= monthStart && o.parsedDate <= monthEnd).length;
        data.push({ period: shortMonthNames[m], orders: ordersCount });
      }
    } else if (chartView === "yearly" && selectedYearRange[0] && selectedYearRange[1]) {
      const startYear = selectedYearRange[0].year();
      const endYear = Math.min(selectedYearRange[1].year(), currentDate.year());
      for (let y = startYear; y <= endYear; y++) {
        const yearStart = dayjs(new Date(y, 0, 1));
        const yearEnd = yearStart.endOf('year');
        const ordersCount = userOrders.filter(o => o.parsedDate >= yearStart && o.parsedDate <= yearEnd).length;
        data.push({ period: y.toString(), orders: ordersCount });
      }
    }

    return data;
  };

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

  const datePickerStyles = {
    '& .MuiInputBase-root': {
      color: 'hsl(var(--foreground)) !important',
      backgroundColor: 'hsl(var(--background))',
      borderColor: 'hsl(var(--border))',
    },
    '& .MuiInputLabel-root': {
      color: 'hsl(var(--muted-foreground)) !important',
    },
    '& .MuiInputBase-input': {
      color: 'hsl(var(--foreground)) !important',
      fontSize: '0.875rem',
    },
    '& .MuiSvgIcon-root': {
      color: 'hsl(var(--muted-foreground)) !important',
    },
    '& .MuiPaper-root': {
      backgroundColor: 'hsl(var(--background))',
      color: 'hsl(var(--foreground))',
    },
    '& .MuiPickersDay-root': {
      color: 'hsl(var(--foreground))',
      backgroundColor: 'hsl(var(--background))',
      '&:hover': {
        backgroundColor: 'hsl(var(--muted))',
      },
    },
    '& .MuiPickersYear-yearButton': {
      color: 'hsl(var(--foreground)) !important',
      backgroundColor: 'hsl(var(--background))',
      '&:hover': {
        backgroundColor: 'hsl(var(--muted))',
      },
      '&.Mui-selected': {
        backgroundColor: 'hsl(var(--primary)) !important',
        color: 'hsl(var(--primary-foreground)) !important',
      },
      '&.Mui-disabled': {
        color: 'hsl(var(--muted-foreground)) !important',
        opacity: 0.5,
      },
    },
    '& .MuiYearCalendar-root': {
      color: 'hsl(var(--foreground))',
    },
    '& .MuiTypography-root': {
      color: 'hsl(var(--foreground))',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'hsl(var(--border))',
      },
      '&:hover fieldset': {
        borderColor: 'hsl(var(--primary))',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'hsl(var(--primary))',
      },
    },
    '& .MuiPickersArrowSwitcher-button': {
      color: 'hsl(var(--foreground)) !important',
    },
  };

  const dateSelector = (
    <>
      {chartView === 'daily' || chartView === 'weekly' ? (
        <DatePicker
          value={selectedRefDate}
          onChange={handleDateSelect}
          maxDate={currentDate}
          minDate={minDate}
          views={['day', 'month', 'year']}
          openTo="day"
          format="DD/MM/YYYY"
          slotProps={{
            textField: {
              size: 'small',
              sx: { width: '180px', ...datePickerStyles },
              InputProps: {
                startAdornment: <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
              }
            }
          }}
        />
      ) : chartView === 'monthly' ? (
        <DatePicker
          value={selectedRefDate}
          onChange={handleDateSelect}
          maxDate={currentDate}
          minDate={minDate}
          views={['year']}
          openTo="year"
          format="YYYY"
          slotProps={{
            textField: {
              size: 'small',
              sx: { width: '180px', ...datePickerStyles },
              InputProps: {
                startAdornment: <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
              }
            }
          }}
        />
      ) : (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">From</span>
          <DatePicker
            value={selectedYearRange[0]}
            onChange={(date) => handleYearRangeSelect(0, date)}
            maxDate={currentDate}
            minDate={minDate}
            views={['year']}
            openTo="year"
            format="YYYY"
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: '100px', ...datePickerStyles }
              }
            }}
          />
          <span className="text-sm text-muted-foreground">To</span>
          <DatePicker
            value={selectedYearRange[1]}
            onChange={(date) => handleYearRangeSelect(1, date)}
            maxDate={currentDate}
            minDate={selectedYearRange[0] || minDate}
            views={['year']}
            openTo="year"
            format="YYYY"
            slotProps={{
              textField: {
                size: 'small',
                sx: { width: '100px', ...datePickerStyles }
              }
            }}
          />
        </div>
      )}
    </>
  );

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
                  src={formData.profile_pic || user.profilePic}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-border"
                />
                {isEditing && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-pic-upload"
                    />
                    <label
                      htmlFor="profile-pic-upload"
                      className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary-hover transition-colors cursor-pointer"
                    >
                      <Camera className="h-4 w-4" />
                    </label>
                  </>
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
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.emailAddress}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
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
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className={`pl-10 ${!isEditing ? "bg-muted" : ""}`}
                  />
                </div>
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
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  {t.cancel}
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  {saving ? 'Saving...' : t.save}
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
              <span className="text-lg font-bold">
                {userStats?.total_orders || getUserOrders().length}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t.totalGenerated}</span>
              </div>
              <span className="text-lg font-bold">
                ${userStats?.total_revenue?.toLocaleString() || getTotalSpent().toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">{t.favoriteCategories}</h4>
              {(userStats?.favorite_categories || getOrdersByCategory()).slice(0, 3).map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.product__category || item.category}
                  </span>
                  <span className="font-medium">
                    {item.count || item.percentage}
                    {item.percentage ? '%' : ' orders'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order History Chart */}
      <Card>
        <CardHeader className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <CardTitle>{t.orderHistory}</CardTitle>
            <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
              <Button
                variant={chartView === "daily" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSetChartView("daily")}
              >
                {t.daily}
              </Button>
              <Button
                variant={chartView === "weekly" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSetChartView("weekly")}
              >
                {t.weekly}
              </Button>
              <Button
                variant={chartView === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSetChartView("monthly")}
              >
                {t.monthly}
              </Button>
              <Button
                variant={chartView === "yearly" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSetChartView("yearly")}
              >
                {t.yearly}
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Period:</span>
              <span className="text-sm font-medium">
                {selectedRefDate && selectedYearRange[0] && selectedYearRange[1] ?
                  getPeriodLabel(chartView, selectedRefDate, selectedYearRange[1]) :
                  'Select period'
                }
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={goPrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {dateSelector}
              </LocalizationProvider>
              <Button variant="ghost" size="sm" onClick={goNext} disabled={!canGoNext()}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={chartView === 'monthly' ? 350 : 300}>
            <LineChart data={getOrderHistory()}>
              <XAxis
                dataKey="period"
                axisLine={{ stroke: 'hsl(var(--foreground))' }}
                tickLine={{ stroke: 'hsl(var(--foreground))' }}
                tick={{
                  fill: 'hsl(var(--foreground))',
                  fontSize: 12,
                  angle: chartView === 'monthly' ? -45 : 0,
                  textAnchor: chartView === 'monthly' ? 'end' : 'middle'
                }}
                height={chartView === 'monthly' ? 80 : 60}
                interval={0}
                label={{
                  value: chartView === 'daily' ? 'Hour' : chartView === 'weekly' ? 'Day' : chartView === 'monthly' ? 'Month' : 'Year',
                  position: 'insideBottomLeft',
                  offset: chartView === 'monthly' ? -40 : -5,
                  fill: 'hsl(var(--foreground))'
                }}
                stroke="hsl(var(--foreground))"
              />
              <YAxis
                label={{
                  value: 'Number of Orders',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  fill: 'hsl(var(--foreground))'
                }}
                stroke="hsl(var(--foreground))"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  borderColor: 'hsl(var(--border))'
                }}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                name={t.orders}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t.recentOrders}</CardTitle>
          <Badge variant="outline" className="ml-2">
            View Only
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>{t.product}</TableHead>
                <TableHead>{t.quantity}</TableHead>
                <TableHead>{t.status}</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>{t.total}</TableHead>
                <TableHead>{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getUserOrders().slice(0, 5).map((order) => {
                const product = getProduct(order);
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
                    <TableCell>{dayjs(order.date).format('MMM D, YYYY')}</TableCell>
                    <TableCell>${getOrderValue(order).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsViewModalOpen(true);
                        }}
                        title="View order details"
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

          {getUserOrders().length > 5 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Showing 5 of {getUserOrders().length} orders
              </p>
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
                    {getProduct(selectedOrder)?.name || 'Unknown Product'}
                  </p>
                </div>
                <div>
                  <Label>{t.category}</Label>
                  <p className="text-foreground font-medium">
                    {getProduct(selectedOrder)?.category || 'Unknown'}
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