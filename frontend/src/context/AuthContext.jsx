import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('school_token');
      const storedUser = localStorage.getItem('school_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        try {
          // Verify with backend
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('school_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, using cached session');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: authToken, user: authUser } = res.data;
        setToken(authToken);
        setUser(authUser);
        localStorage.setItem('school_token', authToken);
        localStorage.setItem('school_user', JSON.stringify(authUser));
        return { success: true, user: authUser };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('school_token');
    localStorage.removeItem('school_user');
    setToken(null);
    setUser(null);
  };

  const isPrincipal = user?.role === 'principal';
  const isTeacher = user?.role === 'teacher';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isPrincipal,
        isTeacher,
        setUser,
      }}
    >
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
