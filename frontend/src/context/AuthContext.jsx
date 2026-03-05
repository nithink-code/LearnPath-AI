import React, { createContext, useState, useContext, useEffect } from 'react';
import { googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem('lumina_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log('Logged in user:', decoded);
      setUser(decoded);
      localStorage.setItem('lumina_user', JSON.stringify(decoded));
    } catch (error) {
      console.error('Login Failed:', error);
    }
  };

  const logout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem('lumina_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
