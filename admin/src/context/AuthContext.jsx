import { createContext, useContext, useState, useEffect } from 'react';
import API from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tb_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('tb_admin_token'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const { token: tk, user: u } = res.data;
    localStorage.setItem('tb_admin_token', tk);
    localStorage.setItem('tb_admin_user', JSON.stringify(u));
    setToken(tk);
    setUser(u);
    return u;
  };

  const logout = async () => {
    try { await API.post('/auth/logout'); } catch (_) {}
    localStorage.removeItem('tb_admin_token');
    localStorage.removeItem('tb_admin_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('tb_admin_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
