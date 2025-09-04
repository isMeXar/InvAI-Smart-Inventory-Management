import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Mail, Phone, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface User {
  id: number;
  name: string;
  role: 'Admin' | 'Manager' | 'Employee';
  email: string;
  phone: string;
  profilePic: string;
}

interface ViewUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({ user, isOpen, onClose }) => {
  const { t } = useLanguage();
  
  if (!user) return null;

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.view} User Details</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="flex items-center space-x-4">
            <img
              src={user.profilePic}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-border"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-foreground">{user.name}</h3>
                <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">ID: {user.id}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{t.email}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{t.phone}</p>
                <p className="text-sm text-muted-foreground">{user.phone}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">{t.role}</p>
                <p className="text-sm text-muted-foreground">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewUserModal;