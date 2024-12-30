import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const BASE_URL = 'http://localhost:3000/api/v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('userToken');
      if (token) {
        const userResponse = await axios.get(`${BASE_URL}/profile`, {
          withCredentials: true,
        });
        setUser(userResponse.data);
        localStorage.setItem('user', JSON.stringify(userResponse.data));
      }
    } catch (error) {
      localStorage.clear();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleLogin = async (username, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/login`, { 
        username, password },
        { withCredentials: true }
      );
      if (response.status === 200 && response.data.token) {
        localStorage.setItem('userToken', response.data.token);
        await loadUserProfile();
      }
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  };

  const handleRegister = async (username, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/register`, {
        username,
        password,
      });
      if (response.status === 201) {
        window.location.href = '/login';
      }
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
      localStorage.clear();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        handleLogin,
        handleLogout,
        handleRegister,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);