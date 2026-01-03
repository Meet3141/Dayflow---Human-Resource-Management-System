import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/authService';
import { attendanceAPI } from '../services/attendanceService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = authAPI.getCurrentUser();
    if (storedUser && authAPI.getToken()) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const userData = await authAPI.login(email, password);
      setUser(userData);
      
      // Auto check-in on login
      try {
        await attendanceAPI.checkIn();
      } catch (attendanceErr) {
        console.warn('Auto check-in failed:', attendanceErr.message);
        // Don't throw error - login should succeed even if check-in fails
      }
      
      return userData;
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (employeeId, name, email, password, role = 'employee') => {
    try {
      setError(null);
      setLoading(true);
      const userData = await authAPI.register(employeeId, name, email, password, role);
      setUser(userData);
      
      // Auto check-in on registration (for new employee first login)
      try {
        await attendanceAPI.checkIn();
      } catch (attendanceErr) {
        console.warn('Auto check-in failed:', attendanceErr.message);
        // Don't throw error - registration should succeed even if check-in fails
      }
      
      return userData;
    } catch (err) {
      const errorMsg = err.message || 'Registration failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Auto check-out on logout
      await attendanceAPI.checkOut();
    } catch (attendanceErr) {
      console.warn('Auto check-out failed:', attendanceErr.message);
      // Don't throw error - logout should succeed even if check-out fails
    }
    
    authAPI.logout();
    setUser(null);
    setError(null);
  };

  const isAuthenticated = () => {
    return !!user && authAPI.isAuthenticated();
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
