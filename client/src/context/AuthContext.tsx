import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import type { User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (loginData: any) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  register: (registerData: any) => Promise<void>;
  resetPassword: (payload: { identifier: string; code: string; password: string }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user profile on mount if token is stored
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success) {
            setUser(res.data);
          } else {
            localStorage.removeItem('token');
          }
        } catch (err: any) {
          console.error('Failed to load user info:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (loginData: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(loginData);
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        setUser({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
        });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credential: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.googleLogin(credential);
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        setUser({ _id: res.data._id, name: res.data.name, email: res.data.email });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Google sign-in failed. Please try again.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.register(registerData);
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        setUser({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
        });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (payload: { identifier: string; code: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.resetPassword(payload);
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        setUser({ _id: res.data._id, name: res.data.name, email: res.data.email });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Could not reset your password.';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        googleLogin,
        register,
        resetPassword,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
