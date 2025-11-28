"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name?: string;
  role?: string;
  roles?: any[]; // Backend roles with permissions
  permissions?: any[]; // Flattened permissions for easy access
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setDemoMode: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication on mount
    checkAuth();
  }, []);

  const checkAuth = () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('auth_token');
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    const userDataRaw = localStorage.getItem('user_data');

    if (token || isDemoMode) {
      setIsAuthenticated(true);

      // Set user data
      if (userDataRaw) {
        try {
          setUser(JSON.parse(userDataRaw));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      } else if (isDemoMode) {
        // Demo user
        setUser({
          id: 1,
          email: 'demo@chatbotdysa.com',
          name: 'Usuario Demo',
          role: 'admin'
        });
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }

    setIsLoading(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Demo credentials check
      if (email === 'demo@chatbotdysa.com' && password === 'demo123') {
        const demoUser = {
          id: 1,
          email: 'demo@chatbotdysa.com',
          name: 'Usuario Demo',
          role: 'admin'
        };

        localStorage.setItem('demo_mode', 'true');
        localStorage.setItem('user_data', JSON.stringify(demoUser));
        localStorage.removeItem('auth_token'); // Remove real auth token if exists
        setUser(demoUser);
        setIsAuthenticated(true);
        return true;
      }

      // Real authentication with backend
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        console.error('Login failed:', response.status, response.statusText);
        return false;
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        console.error('Invalid response format:', result);
        return false;
      }

      const { accessToken, refreshToken, user: backendUser } = result.data;

      // Save tokens
      localStorage.setItem('auth_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      localStorage.removeItem('demo_mode'); // Remove demo mode

      // Transform backend user to frontend format
      const transformedUser = {
        id: backendUser.id,
        email: backendUser.email,
        name: backendUser.firstName && backendUser.lastName
          ? `${backendUser.firstName} ${backendUser.lastName}`
          : backendUser.email.split('@')[0],
        role: backendUser.roles && backendUser.roles.length > 0
          ? backendUser.roles[0].name
          : 'user',
        roles: backendUser.roles || [],
        permissions: backendUser.roles && backendUser.roles[0]?.permissions
          ? backendUser.roles[0].permissions
          : []
      };

      localStorage.setItem('user_data', JSON.stringify(transformedUser));
      setUser(transformedUser);
      setIsAuthenticated(true);

      console.log('✅ Login successful:', transformedUser.email);
      return true;

    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('🚪 Cerrando sesión...');

    // Limpiar TODA la información de autenticación (producción Y demo)
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('demo_mode');
    localStorage.removeItem('demo_token');

    setUser(null);
    setIsAuthenticated(false);

    console.log('✅ Sesión cerrada completamente');
  };

  const setDemoMode = (enabled: boolean) => {
    if (enabled) {
      const demoUser = {
        id: 1,
        email: 'demo@chatbotdysa.com',
        name: 'Usuario Demo',
        role: 'admin'
      };

      localStorage.setItem('demo_mode', 'true');
      localStorage.setItem('user_data', JSON.stringify(demoUser));
      localStorage.removeItem('auth_token');
      setUser(demoUser);
      setIsAuthenticated(true);
    } else {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      logout,
      setDemoMode
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;