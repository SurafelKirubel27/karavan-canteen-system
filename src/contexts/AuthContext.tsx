'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'canteen' | 'admin';
  department?: string;
  phone?: string;
  officeLocation?: string;
  preferredDeliveryLocation?: string;
  dietaryRestrictions?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (user: User) => Promise<void>;
  logout: () => void;
  updateUser?: (user: User) => void;
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
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const savedUser = localStorage.getItem('karavanUser');

      if (savedUser) {
        const user = JSON.parse(savedUser);
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = async (user: User): Promise<void> => {
    localStorage.setItem('karavanUser', JSON.stringify(user));
    setAuthState({
      user,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem('karavanUser');
    localStorage.removeItem('karavanCart'); // Clear cart on logout

    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem('karavanUser', JSON.stringify(updatedUser));
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
