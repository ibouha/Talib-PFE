import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../services/api';
import authService, { LoginCredentials, RegisterData, AdminLoginCredentials } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string; user?: User }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string; user?: User }>;
  adminLogin: (credentials: AdminLoginCredentials) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
  refreshUser: () => void;
  isAuthenticated: boolean;
  isStudent: boolean;
  isOwner: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const storedUser = authService.getUser();
    const storedToken = authService.getToken();

    console.log('AuthContext initialization:', { storedUser, storedToken });

    if (storedUser && storedToken) {
      setUser(storedUser);
      console.log('User restored from localStorage:', storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success) {
        const loginData = response.data;
        console.log('Login successful, received data:', loginData);

        // Extract user data and token from login response
        const userData = {
          ...loginData.user,
          role: loginData.role,
          token: loginData.token
        };

        console.log('Setting user with token:', userData);
        setUser(userData);
        authService.setUser(userData);
        return { success: true, user: userData };
      } else {
        console.log('Login failed:', response.message);
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      if (response.success) {
        const registerData = response.data;
        console.log('Registration successful, received data:', registerData);

        // Handle registration response (might not have token)
        const userData = registerData.token ? {
          ...registerData.user,
          role: registerData.role,
          token: registerData.token
        } : {
          ...registerData,
          role: registerData.role
        };

        setUser(userData);
        authService.setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const adminLogin = async (credentials: AdminLoginCredentials) => {
    try {
      setLoading(true);
      const response = await authService.adminLogin(credentials);
      
      if (response.success) {
        const adminData = response.data;
        console.log('Admin login successful, received data:', adminData);

        // Extract admin data and token
        const userData = {
          ...adminData.user,
          role: adminData.role,
          token: adminData.token
        };

        setUser(userData);
        authService.setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Admin login failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  const refreshUser = () => {
    // Refresh user data from localStorage (after profile updates)
    const storedUser = authService.getUser();
    if (storedUser) {
      setUser(storedUser);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    adminLogin,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isOwner: user?.role === 'owner',
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
