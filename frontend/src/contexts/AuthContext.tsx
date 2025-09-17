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
  updateUser: (userData: any) => void;
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
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        // Transform backend user data to frontend format
        const user: User = {
          ...response,
          name: `${response.first_name} ${response.last_name}`.trim() || response.username,
          profilePic: response.profile_pic || `https://randomuser.me/api/portraits/${response.first_name === 'Alice' || response.first_name === 'Diana' ? 'women' : 'men'}/1.jpg`
        };
        setUser(user);
      } catch (error) {
        // User is not authenticated, keep user as null
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  // Check for inactivity and auto-logout
  useEffect(() => {
    if (!user) return;

    const checkInactivity = () => {
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

      if (inactiveTime >= oneHour) {
        logout();
      }
    };

    // Check every minute
    const intervalId = setInterval(checkInactivity, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [user, lastActivity]);

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

  const updateUser = (userData: any) => {
    // Transform backend user data to frontend format
    const updatedUser: User = {
      ...userData,
      name: `${userData.first_name} ${userData.last_name}`.trim() || userData.username,
      profilePic: userData.profile_pic || user?.profilePic || `https://randomuser.me/api/portraits/${userData.first_name === 'Alice' || userData.first_name === 'Diana' ? 'women' : 'men'}/1.jpg`
    };
    setUser(updatedUser);
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};