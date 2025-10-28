import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';
import { apiService } from '../services';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Set a timeout in case AsyncStorage hangs
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve(null), 3000);
      });
      
      const tokenPromise = apiService.getStoredToken();
      const token = await Promise.race([tokenPromise, timeoutPromise]);
      
      // If we have a token, we consider the user authenticated
      // In a production app, you'd validate the token with the server
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoading(false);
    }
  };

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    await apiService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

