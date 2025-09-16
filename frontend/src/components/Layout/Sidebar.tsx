import React from 'react';
import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  UserCog,
  Settings,
  LogOut,
  Package2,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const navigation = [
    { name: t.dashboard, href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Employee'] },
    { name: t.users, href: '/dashboard/users', icon: Users, roles: ['Admin'] },
    { name: t.products, href: '/dashboard/products', icon: Package, roles: ['Admin', 'Manager', 'Employee'] },
    { name: t.suppliers, href: '/dashboard/suppliers', icon: Package2, roles: ['Admin', 'Manager', 'Employee'] },
    { name: t.orders, href: '/dashboard/orders', icon: ShoppingCart, roles: ['Admin', 'Manager', 'Employee'] },
    // { name: t.forecasts, href: '/dashboard/forecasts', icon: TrendingUp, roles: ['Admin', 'Manager'] },
    { name: t.profile, href: '/dashboard/profile', icon: UserCog, roles: ['Admin', 'Manager', 'Employee'] },
    { name: t.settings, href: '/dashboard/settings', icon: Settings, roles: ['Admin', 'Manager', 'Employee'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || 'Employee')
  );

  const isActive = (href: string) => location.pathname === href;

  return (
    <motion.div
      initial={{ width: isCollapsed ? 80 : 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="relative h-full flex flex-col overflow-hidden bg-card/95 backdrop-blur-sm border-r border-border/40"
      style={{
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
      }}
    >

      {/* Logo Section */}
      <div className="relative p-6 border-b border-border/50">
        <motion.div
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative">
            <motion.div
              className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/80) 100%)',
                boxShadow: '0 8px 32px hsl(var(--primary)/30)'
              }}
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Package className="h-6 w-6 text-white relative z-10" />
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <Sparkles className="h-2.5 w-2.5 text-white m-0.5" />
            </motion.div>
          </div>

          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-col"
            >
              <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Smart Inventory
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                AI-Powered Management
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 p-4 space-y-3">
        {filteredNavigation.map((item, index) => {
          const isActiveRoute = isActive(item.href);
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <NavLink
                to={item.href}
                className={cn(
                  "group relative flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:bg-muted/50",
                  isActiveRoute
                    ? "bg-primary/10 text-primary border-l-4 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Icon */}
                <motion.div
                  className={cn(
                    "flex items-center justify-center transition-colors duration-200",
                    isCollapsed ? "w-full" : "w-6 mr-3"
                  )}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                      isActiveRoute ? "text-primary" : "group-hover:text-primary"
                    )}
                  />
                </motion.div>

                {/* Text */}
                {!isCollapsed && (
                  <span className="font-medium">
                    {item.name}
                  </span>
                )}
              </NavLink>
            </motion.div>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="relative p-6 border-t border-border/50">
        {!isCollapsed && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mb-6"
          >
            <motion.div
              className="flex items-center space-x-3 p-3 rounded-xl border border-border/20"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <motion.img
                  src={user.profilePic}
                  alt={user.name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/20"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  {user.role}
                </p>
              </div>
              <motion.div
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        )}

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="ghost"
            onClick={logout}
            className={cn(
              "group relative w-full justify-start font-semibold transition-all duration-300 overflow-hidden",
              "hover:bg-destructive/10 hover:text-destructive rounded-xl py-3",
              isCollapsed && "justify-center px-2"
            )}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            />

            <motion.div
              className="relative z-10 mr-3"
              whileHover={{ rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
            </motion.div>

            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="relative z-10"
              >
                {t.logout}
              </motion.span>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sidebar;