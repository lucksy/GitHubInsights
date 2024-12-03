// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitHubUser } from '../services/github/types';
import { githubService } from '../services/github/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('github_token');
      if (storedToken) {
        try {
          githubService.setToken(storedToken);
          const userData = await githubService.getCurrentUser();
          setToken(storedToken);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to validate token:', error);
          handleLogout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (newToken: string) => {
    setLoading(true);
    try {
      githubService.setToken(newToken);
      const userData = await githubService.getCurrentUser();
      
      localStorage.setItem('github_token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('github_token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const logout = () => {
    handleLogout();
    navigate('/login');
  };

  const value = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
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