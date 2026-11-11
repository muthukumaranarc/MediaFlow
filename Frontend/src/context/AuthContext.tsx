import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('mediaflow_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('mediaflow_token');
      if (savedToken) {
        try {
          const res = await api.get<AuthResponse>('/api/auth/me');
          setUser({
            userId: res.data.userId,
            displayName: res.data.displayName,
            email: res.data.email,
            role: res.data.role,
          });
        } catch (e) {
          localStorage.removeItem('mediaflow_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const handleAuthSuccess = (data: AuthResponse) => {
    if (data.token) {
      localStorage.setItem('mediaflow_token', data.token);
      setToken(data.token);
    }
    setUser({
      userId: data.userId,
      displayName: data.displayName,
      email: data.email,
      role: data.role,
    });
  };

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/api/auth/login', { email, password });
    handleAuthSuccess(res.data);
  };

  const register = async (displayName: string, email: string, password: string) => {
    const res = await api.post<AuthResponse>('/api/auth/register', { displayName, email, password });
    handleAuthSuccess(res.data);
  };

  const loginDemo = async () => {
    const res = await api.get<AuthResponse>('/api/auth/demo');
    handleAuthSuccess(res.data);
  };

  const logout = () => {
    localStorage.removeItem('mediaflow_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
