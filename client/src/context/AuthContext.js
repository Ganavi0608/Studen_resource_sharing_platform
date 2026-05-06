import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const SESSION_KEY = 'srsp_session';
const TOKEN_KEY = 'srsp_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);

  const saveSession = (userData, tok) => {
    setUser(userData);
    setToken(tok);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, tok);
  };

  const register = async ({ name, studentId, email, department, year, password }) => {
    try {
      const res = await axios.post('/api/auth/register', { name, studentId, email, department, year, password });
      saveSession(res.data.user, res.data.token);
      return null;
    } catch (err) {
      return err.response?.data?.message || 'Registration failed';
    }
  };

  const login = async ({ email, password }) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      saveSession(res.data.user, res.data.token);
      return null;
    } catch (err) {
      return err.response?.data?.message || 'Invalid email or password';
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
