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
  Package2
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
      initial={{ width: isCollapsed ? 80 : 240 }}
      animate={{ width: isCollapsed ? 80 : 240 }}
      transition={{ duration: 0.3 }}
      className="bg-card border-r border-border h-full flex flex-col shadow-lg"
    >
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="font-semibold text-foreground"
            >
              Smart Inventory
            </motion.span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              isActive(item.href)
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {item.name}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-border">
        {!isCollapsed && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <div className="flex items-center space-x-3 mb-2">
              <img
                src={user.profilePic}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.role}
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive",
            isCollapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="ml-3"
            >
              {t.logout}
            </motion.span>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default Sidebar;