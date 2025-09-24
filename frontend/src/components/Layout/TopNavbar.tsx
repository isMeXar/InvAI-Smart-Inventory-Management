import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Menu, Sun, Moon, User, Settings, LogOut, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { NotificationProvider } from '@/contexts/NotificationContext';
import NotificationBell from '@/components/notifications/NotificationBell';

interface TopNavbarProps {
  onToggleSidebar: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative bg-card/95 backdrop-blur-sm border-b border-border/40 sticky top-0 z-40"
      style={{
        height: '84px', // Match sidebar logo section height (p-6 = 24px top + 24px bottom + content)
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)'
      }}
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Menu toggle */}
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="relative p-2 rounded-xl hover:bg-muted/50 transition-all duration-200"
            >
              <motion.div
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="h-5 w-5" />
              </motion.div>
            </Button>
          </motion.div>

        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <NotificationProvider>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NotificationBell />
            </motion.div>
          </NotificationProvider>

          {/* Theme Toggle */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-muted/50 transition-all duration-200"
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </motion.div>
            </Button>
          </motion.div>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-muted/50 transition-all duration-200"
                  >
                    <div className="relative">
                      <Avatar className="h-9 w-9 border-2 border-primary/20">
                        <AvatarImage src={user.profilePic} alt={user.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <motion.div
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-background rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                      />
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.role}</p>
                    </div>
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64 bg-popover border-border/40 shadow-xl rounded-xl p-2"
                style={{
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                }}
              >
                <div className="px-3 py-3 border-b border-border/50">
                  <p className="text-sm font-semibold text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>

                <div className="py-2">
                  <DropdownMenuItem
                    onClick={() => navigate('/profile')}
                    className="cursor-pointer hover:bg-muted/50 rounded-lg px-3 py-2 transition-colors"
                  >
                    <User className="mr-3 h-4 w-4 text-primary" />
                    <span className="font-medium">{t.profile}</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => navigate('/settings')}
                    className="cursor-pointer hover:bg-muted/50 rounded-lg px-3 py-2 transition-colors"
                  >
                    <Settings className="mr-3 h-4 w-4 text-primary" />
                    <span className="font-medium">{t.settings}</span>
                  </DropdownMenuItem>
                </div>

                <div className="pt-2 border-t border-border/50">
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer hover:bg-destructive/10 hover:text-destructive rounded-lg px-3 py-2 transition-colors"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">{t.logout}</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default TopNavbar;