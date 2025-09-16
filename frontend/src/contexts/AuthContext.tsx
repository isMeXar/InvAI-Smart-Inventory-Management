import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';

export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  name?: string;
  role: 'Admin' | 'Manager' | 'Employee';
  email: string;
  phone: string;
  profile_pic: string;
  profilePic?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Don't automatically check auth status on page load
    // This prevents auto-login behavior
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(email, password);
      // Transform backend user data to frontend format
      const user: User = {
        ...response.user,
        name: `${response.user.first_name} ${response.user.last_name}`.trim() || response.user.username,
        profilePic: response.user.profile_pic || `https://randomuser.me/api/portraits/${response.user.first_name === 'Alice' || response.user.first_name === 'Diana' ? 'women' : 'men'}/1.jpg`
      };
      setUser(user);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};