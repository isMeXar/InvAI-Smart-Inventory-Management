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
import { SegmentedControl } from '@/components/ui/segmented-control';
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
import { createTheme, ThemeProvider } from '@mui/material/styles';
import dayjs, { Dayjs } from 'dayjs';
import minMax from 'dayjs/plugin/minMax';

dayjs.extend(minMax);

interface Order {
  id: number;
  product: number;
  productId?: number;
  user: number | { id: number };
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

// Function to get localized month names
const getLocalizedMonthNames = (language: string) => {
  const locale = language === 'en' ? 'en-US' : language === 'de' ? 'de-DE' : language === 'fr' ? 'fr-FR' : 'en-US';

  const fullMonths = Array.from({ length: 12 }, (_, i) => {
    return new Date(2024, i, 1).toLocaleDateString(locale, { month: 'long' });
  });

  const shortMonths = Array.from({ length: 12 }, (_, i) => {
    return new Date(2024, i, 1).toLocaleDateString(locale, { month: 'short' });
  });

  return { fullMonths, shortMonths };
};

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t, language } = useLanguage();
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
  const [selectedYearRange, setSelectedYearRange] = useState<[Dayjs | null, Dayjs | null]>([dayjs('2020-01-01').startOf('year'), currentDate.endOf('year')]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(5);

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
             (typeof order.user === 'object' && order.user && order.user.id === user.id);
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

  // Pagination functions
  const getPaginatedOrders = () => {
    const userOrders = getUserOrders();
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    return userOrders.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const userOrders = getUserOrders();
    return Math.ceil(userOrders.length / recordsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRecordsPerPageChange = (value: number) => {
    setRecordsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing records per page
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
      setSelectedYearRange([dayjs('2020-01-01').startOf('year'), currentDate.endOf('year')]);
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

  // Detect if we're in dark mode by checking the document class or data attribute
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      // Check for common dark mode indicators
      const html = document.documentElement;
      const body = document.body;

      const isDark =
        html.classList.contains('dark') ||
        body.classList.contains('dark') ||
        html.getAttribute('data-theme') === 'dark' ||
        body.getAttribute('data-theme') === 'dark' ||
        getComputedStyle(html).getPropertyValue('--background').includes('0 0% 3.9%') || // common dark bg
        getComputedStyle(body).backgroundColor === 'rgb(3, 7, 18)'; // check computed dark bg

      setIsDarkMode(isDark);
    };

    checkTheme();

    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    return () => observer.disconnect();
  }, []);

  // Create a custom theme for Material-UI DatePicker based on detected theme
  const datePickerTheme = useMemo(() => createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#3b82f6',
      },
    },
    components: {
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDarkMode ? '#6b7280' : '#d1d5db',
              borderWidth: '1px',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDarkMode ? '#9ca3af' : '#9ca3af',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#3b82f6',
              borderWidth: '2px',
            },
          },
          input: {
            color: isDarkMode ? '#ffffff !important' : '#000000 !important',
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          input: {
            color: isDarkMode ? '#ffffff !important' : '#000000 !important',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
            border: `1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'}`,
          },
        },
      },
    },
  }), [isDarkMode]);

  const getOrderHistory = () => {
    // Get localized month names
    const { fullMonths, shortMonths } = getLocalizedMonthNames(language);

    // Use API data if available and matches current view
    if (userStats?.monthly_orders && chartView === "monthly" && selectedRefDate?.year() === currentDate.year()) {
      // Transform API data to include localized month names
      return userStats.monthly_orders.map((item: any, index: number) => ({
        period: shortMonths[index] || item.period,
        orders: item.orders,
        fullMonth: fullMonths[index] || item.period
      }));
    }

    // Fallback to calculated data from orders
    const userOrders = getUserOrders().map(order => ({
      ...order,
      parsedDate: dayjs(order.date)
    })).filter(o => o.parsedDate.isValid());
    const data: { period: string; orders: number; fullMonth?: string }[] = [];

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
        data.push({ period: shortMonths[m], orders: ordersCount, fullMonth: fullMonths[m] });
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

    // Debug: Log the data for monthly view
    if (chartView === "monthly") {
      console.log("Monthly chart data with localized names:", data);
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
    // Input field styles
    '& .MuiInputBase-root': {
      color: 'hsl(var(--foreground)) !important',
      backgroundColor: 'hsl(var(--background)) !important',
    },
    '& .MuiInputBase-input': {
      color: 'hsl(var(--foreground)) !important',
      fontSize: '0.875rem !important',
      backgroundColor: 'transparent !important',
      WebkitTextFillColor: 'hsl(var(--foreground)) !important',
    },
    '& .MuiOutlinedInput-root': {
      color: 'hsl(var(--foreground)) !important',
      backgroundColor: 'hsl(var(--background)) !important',
      '& input': {
        color: 'hsl(var(--foreground)) !important',
        WebkitTextFillColor: 'hsl(var(--foreground)) !important',
      },
      '& fieldset': {
        borderColor: 'hsl(var(--border)) !important',
        border: '1px solid hsl(var(--border)) !important',
      },
      '&:hover fieldset': {
        borderColor: 'hsl(var(--border)) !important',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'hsl(var(--primary)) !important',
        borderWidth: '2px !important',
      },
    },
    '& .MuiOutlinedInput-input': {
      color: 'hsl(var(--foreground)) !important',
      WebkitTextFillColor: 'hsl(var(--foreground)) !important',
    },
    // Labels and icons
    '& .MuiInputLabel-root': {
      color: 'hsl(var(--muted-foreground)) !important',
    },
    '& .MuiSvgIcon-root': {
      color: 'hsl(var(--muted-foreground)) !important',
    },
    '& .MuiInputAdornment-root': {
      color: 'hsl(var(--muted-foreground)) !important',
    },
    // Dropdown/Calendar styles
    '& .MuiPaper-root': {
      backgroundColor: 'hsl(var(--background)) !important',
      color: 'hsl(var(--foreground)) !important',
      border: '1px solid hsl(var(--border)) !important',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important',
    },
    '& .MuiPickersDay-root': {
      color: 'hsl(var(--foreground)) !important',
      backgroundColor: 'hsl(var(--background))',
      '&:hover': {
        backgroundColor: 'hsl(var(--muted)) !important',
      },
      '&.Mui-selected': {
        backgroundColor: 'hsl(var(--primary)) !important',
        color: 'hsl(var(--primary-foreground)) !important',
      },
    },
    '& .MuiPickersYear-yearButton': {
      color: 'hsl(var(--foreground)) !important',
      backgroundColor: 'transparent !important',
      '&:hover': {
        backgroundColor: 'hsl(var(--muted)) !important',
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
      color: 'hsl(var(--foreground)) !important',
    },
    '& .MuiTypography-root': {
      color: 'hsl(var(--foreground)) !important',
    },
    '& .MuiPickersArrowSwitcher-button': {
      color: 'hsl(var(--foreground)) !important',
    },
    '& .MuiPickersCalendarHeader-root': {
      color: 'hsl(var(--foreground)) !important',
    },
    '& .MuiPickersCalendarHeader-label': {
      color: 'hsl(var(--foreground)) !important',
    },
    // Additional specific selectors to override Material-UI defaults
    '& input[type="text"]': {
      color: 'hsl(var(--foreground)) !important',
      WebkitTextFillColor: 'hsl(var(--foreground)) !important',
    },
    '& .MuiInputBase-formControl': {
      color: 'hsl(var(--foreground)) !important',
    },
  };

  const dateSelector = (
    <ThemeProvider theme={datePickerTheme}>
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
              sx: {
                width: { xs: '120px', sm: '140px', md: '160px' },
              },
              InputProps: {
                startAdornment: <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
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
              sx: {
                width: { xs: '100px', sm: '120px', md: '140px' },
              },
              InputProps: {
                startAdornment: <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
              }
            }
          }}
        />
      ) : (
        <div className="flex items-center space-x-1 sm:space-x-2">
          <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">From</span>
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
                sx: {
                  width: { xs: '80px', sm: '90px', md: '100px' },
                }
              }
            }}
          />
          <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">To</span>
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
                sx: {
                  width: { xs: '80px', sm: '90px', md: '100px' },
                }
              }
            }}
          />
        </div>
      )}
    </ThemeProvider>
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
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t.profile}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t.manageAccount}
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          size="sm"
          className={!isEditing ? "bg-primary hover:bg-primary/90" : ""}
        >
          <Edit className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{isEditing ? t.cancel : t.editProfile}</span>
          <span className="sm:hidden">{isEditing ? t.cancel : "Edit"}</span>
        </Button>
      </div>

      {/* Profile Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-semibold text-foreground">{t.personalInformation}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                <img
                  src={formData.profile_pic || user.profilePic}
                  alt={user.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-1 ring-border shadow-sm"
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
                      className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-all duration-200 cursor-pointer shadow-md"
                    >
                      <Camera className="h-3 w-3" />
                    </label>
                  </>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Badge className={`${getRoleColor(user.role)} text-xs font-medium px-3 py-1`} variant="secondary">
                      {user.role}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ID: <span className="font-mono font-medium">{user.id}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-medium text-foreground">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  disabled={!isEditing}
                  className={`h-10 transition-colors ${!isEditing ? "bg-muted/30 border-muted" : "focus:border-primary"}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-medium text-foreground">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  disabled={!isEditing}
                  className={`h-10 transition-colors ${!isEditing ? "bg-muted/30 border-muted" : "focus:border-primary"}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">{t.emailAddress}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className={`pl-10 h-10 transition-colors ${!isEditing ? "bg-muted/30 border-muted" : "focus:border-primary"}`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">{t.phoneNumber}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className={`pl-10 h-10 transition-colors ${!isEditing ? "bg-muted/30 border-muted" : "focus:border-primary"}`}
                  />
                </div>
              </div>
              {/* <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="role" className="text-sm font-medium text-foreground">{t.role}</Label>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="role"
                    value={user.role}
                    disabled
                    className="bg-muted/30 border-muted h-10 max-w-xs"
                  />
                </div>
              </div> */}
            </div>

            {isEditing && (
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                <Button variant="outline" onClick={() => setIsEditing(false)} size="sm" className="order-2 sm:order-1">
                  {t.cancel}
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 order-1 sm:order-2"
                >
                  {saving ? 'Saving...' : t.save}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-semibold text-foreground">{t.activitySummary}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-50/30 dark:from-blue-950/20 dark:to-blue-950/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{t.totalOrders}</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {userStats?.total_orders || getUserOrders().length}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-green-50/30 dark:from-green-950/20 dark:to-green-950/10 rounded-lg border border-green-100 dark:border-green-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{t.totalGenerated}</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${userStats?.total_revenue?.toLocaleString() || getTotalSpent().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                {t.favoriteCategories}
              </h4>
              <div className="space-y-3">
                {(userStats?.favorite_categories || getOrdersByCategory()).slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium text-foreground truncate">
                      {item.product__category || item.category}
                    </span>
                    <span className="text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                      {item.count || item.percentage}
                      {item.percentage ? '%' : ' orders'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order History Chart */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
            <CardTitle className="text-lg md:text-xl">{t.orderHistory}</CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="w-full sm:w-auto">
                <SegmentedControl
                  options={[
                    { value: "daily", label: t.daily },
                    { value: "weekly", label: t.weekly },
                    { value: "monthly", label: t.monthly },
                    { value: "yearly", label: t.yearly }
                  ]}
                  value={chartView}
                  onChange={(value) => handleSetChartView(value as ChartView)}
                />
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button variant="ghost" size="sm" onClick={goPrev} className="h-8 w-8 p-0">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  {dateSelector}
                </LocalizationProvider>
                <Button variant="ghost" size="sm" onClick={goNext} disabled={!canGoNext()} className="h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <span className="text-muted-foreground">{t.period || 'Period'}:</span>
            <span className="font-medium text-foreground">
              {chartView === 'yearly' && selectedYearRange[0] && selectedYearRange[1] ?
                getPeriodLabel(chartView, selectedYearRange[0], selectedYearRange[1]) :
                selectedRefDate ?
                getPeriodLabel(chartView, selectedRefDate) :
                t.selectPeriod || 'Select period'
              }
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getOrderHistory()}>
              <XAxis
                dataKey="period"
                axisLine={{ stroke: 'hsl(var(--foreground))' }}
                tickLine={{ stroke: 'hsl(var(--foreground))' }}
                tick={{
                  fill: 'hsl(var(--foreground))',
                  fontSize: 12,
                  textAnchor: 'middle'
                }}
                angle={0}
                height={60}
                interval={chartView === 'monthly' ? 0 : 'preserveStartEnd'}
                label={{
                  value: chartView === 'daily' ? 'Hour' : chartView === 'weekly' ? 'Day' : chartView === 'monthly' ? 'Months' : 'Year',
                  position: 'insideBottom',
                  offset: 0,
                  fill: 'hsl(var(--foreground))',
                  textAnchor: 'middle'
                }}
                stroke="hsl(var(--foreground))"
              />
              <YAxis
                label={{
                  value: `${t.numberOfOrders || 'Number of Orders'}`,
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  fill: 'hsl(var(--foreground))',
                  style: { textAnchor: 'middle' }
                }}
                stroke="hsl(var(--foreground))"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  borderColor: 'hsl(var(--border))'
                }}
                labelFormatter={(label, payload) => {
                  if (chartView === 'monthly' && payload && payload.length > 0) {
                    const data = payload[0].payload;
                    return data.fullMonth || label;
                  }
                  return label;
                }}
                formatter={(value, name) => [value, t.orders]}
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
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl font-semibold text-foreground">{t.recentOrders}</CardTitle>
            <Badge variant="outline" className="px-2 py-1 text-xs">
              <Eye className="h-3 w-3 mr-1" />
              View Only
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {getUserOrders().length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-muted/20 rounded-full w-fit mx-auto mb-4">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Found</h3>
              <p className="text-muted-foreground">{t.noOrdersForUser}</p>
            </div>
          ) : (
            <>
              {/* Order Cards - Column Aligned Layout */}
              <div className="space-y-0">
                {/* Column Headers */}
                <div className="grid grid-cols-[140px_2fr_80px_100px_120px_60px] gap-6 px-4 py-3 border-b border-border/50 bg-muted/20">
                  <div className="text-sm font-semibold text-foreground">{t.orders}</div>
                  <div className="text-sm font-semibold text-foreground">{t.product}</div>
                  <div className="text-sm font-semibold text-foreground text-center hidden sm:block">{t.quantity}</div>
                  <div className="text-sm font-semibold text-foreground text-center hidden sm:block">{t.status}</div>
                  <div className="text-sm font-semibold text-foreground text-right">{t.total}</div>
                  <div className="text-sm font-semibold text-foreground text-center">{t.actions}</div>
                </div>

                {getPaginatedOrders().map((order, index) => {
                  const product = getProduct(order);
                  return (
                    <div
                      key={order.id}
                      className={`group grid grid-cols-[140px_2fr_80px_100px_120px_60px] gap-6 px-4 py-3 border-b border-border/30 hover:bg-muted/10 transition-colors duration-150 ${
                        index % 2 === 0 ? 'bg-background' : 'bg-muted/5'
                      }`}
                    >
                      {/* Order Column */}
                      <div className="flex items-center">
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-semibold text-primary">#{order.id}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">{dayjs(order.date).format('MMM D, YYYY')}</p>
                        </div>
                      </div>

                      {/* Product Column */}
                      <div className="min-w-0 flex flex-col justify-center">
                        <h4 className="font-medium text-foreground text-sm truncate">
                          {product?.name || t.unknownProduct}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {product?.category || 'Unknown Category'}
                        </p>
                      </div>

                      {/* Quantity Column (hidden on mobile) */}
                      <div className="hidden sm:flex items-center justify-center">
                        <span className="font-semibold text-sm text-foreground">
                          {order.quantity}
                        </span>
                      </div>

                      {/* Status Column (hidden on mobile) */}
                      <div className="hidden sm:flex items-center">
                        <Badge className={`${getStatusColor(order.status)} text-xs px-2 py-1 w-full justify-center`} variant="secondary">
                          {order.status}
                        </Badge>
                      </div>

                      {/* Total Column */}
                      <div className="flex flex-col justify-center">
                        <p className="text-sm font-bold text-green-600 dark:text-green-400 text-right">
                          ${getOrderValue(order).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground sm:hidden text-right">
                          Qty: {order.quantity} • {order.status}
                        </p>
                      </div>

                      {/* Actions Column */}
                      <div className="flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsViewModalOpen(true);
                          }}
                          className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination - Always show if there are records */}
              {getUserOrders().length > 0 && (
                <div className="pt-4 mt-4 border-t border-border/50">
                  {/* Pagination section */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Left: Showing info */}
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * recordsPerPage) + 1} to {Math.min(currentPage * recordsPerPage, getUserOrders().length)} of {getUserOrders().length} orders
                    </div>

                    {/* Center: Pagination controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 transition-colors ${
                          currentPage === 1
                            ? 'text-muted-foreground/40 cursor-not-allowed'
                            : 'text-foreground hover:text-primary cursor-pointer'
                        }`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      {Array.from({ length: Math.max(1, getTotalPages()) }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className={`h-9 w-9 p-0 rounded-full ${currentPage === page ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                        >
                          {page}
                        </Button>
                      ))}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= getTotalPages()}
                        className={`p-2 transition-colors ${
                          currentPage >= getTotalPages()
                            ? 'text-muted-foreground/40 cursor-not-allowed'
                            : 'text-foreground hover:text-primary cursor-pointer'
                        }`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Right: Records per page selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">Show:</span>
                      <select
                        value={recordsPerPage}
                        onChange={(e) => handleRecordsPerPageChange(Number(e.target.value))}
                        className="h-9 px-3 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <AIInsights 
        data={{
          userOrders: getUserOrders().length,
          recentActivity: getUserOrders().slice(0, 5).length
        }} 
        pageType="profile" 
      />

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