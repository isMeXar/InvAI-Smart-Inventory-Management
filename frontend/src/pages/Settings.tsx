import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Lock, 
  Bell, 
  Moon, 
  Sun, 
  Monitor, 
  Save,
  Shield,
  Mail,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    orders: true,
    inventory: true,
    reports: false
  });

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      // Handle password mismatch
      return;
    }
    // Handle password change logic
    console.log('Password change requested');
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t.settings}</h1>
          <p className="text-muted-foreground mt-1">
            {t.manageAccountPreferences}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t.accountSecurity}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="current-password">{t.currentPassword}</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t.enterCurrentPassword}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">{t.newPassword}</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t.enterNewPassword}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">{t.confirmPassword}</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmNewPassword}
                />
              </div>
              <Button 
                onClick={handlePasswordChange}
                className="w-full bg-gradient-primary hover:opacity-90"
              >
                <Lock className="h-4 w-4 mr-2" />
                {t.updatePassword}
              </Button>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">{t.twoFactorAuth}</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{t.enable2FA}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.extraLayerSecurity}
                  </p>
                </div>
                <Switch defaultChecked={false} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              {t.appearance}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">{t.theme}</h4>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-full">
                  {getThemeIcon(theme)}
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center">
                      <Sun className="h-4 w-4 mr-2" />
                      {t.light}
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center">
                      <Moon className="h-4 w-4 mr-2" />
                      {t.dark}
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center">
                      <Monitor className="h-4 w-4 mr-2" />
                      {t.system}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">{t.language}</h4>
              <Select value={language} onValueChange={(value: 'en' | 'de' | 'fr') => setLanguage(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{t.compactMode}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.showMoreContent}
                  </p>
                </div>
                <Switch defaultChecked={false} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{t.animations}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.enableSmoothTransitions}
                  </p>
                </div>
                <Switch defaultChecked={true} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t.notificationPreferences}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">{t.deliveryMethods}</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-foreground">{t.emailNotifications}</p>
                      <p className="text-xs text-muted-foreground">{t.receiveUpdatesEmail}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-foreground">{t.pushNotifications}</p>
                      <p className="text-xs text-muted-foreground">{t.receiveBrowserNotifications}</p>
                    </div>
                  </div>
                  <Switch 
                    checked={notifications.push}
                    onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">{t.notificationTypes}</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">{t.orderUpdates}</p>
                    <p className="text-xs text-muted-foreground">{t.statusChangesTracking}</p>
                  </div>
                  <Switch 
                    checked={notifications.orders}
                    onCheckedChange={(checked) => handleNotificationChange('orders', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">{t.inventoryAlerts}</p>
                    <p className="text-xs text-muted-foreground">{t.lowStockReorder}</p>
                  </div>
                  <Switch 
                    checked={notifications.inventory}
                    onCheckedChange={(checked) => handleNotificationChange('inventory', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">{t.weeklyReports}</p>
                    <p className="text-xs text-muted-foreground">{t.performanceSummaries}</p>
                  </div>
                  <Switch 
                    checked={notifications.reports}
                    onCheckedChange={(checked) => handleNotificationChange('reports', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-gradient-primary hover:opacity-90">
          <Save className="h-4 w-4 mr-2" />
          {t.saveAllSettings}
        </Button>
      </div>
    </motion.div>
  );
};

export default Settings;