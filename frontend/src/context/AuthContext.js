import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const BASE_URL = 'http://localhost:3000/api/v1';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async () => {
    try {
      setLoading(true); // Start loading

      const token = localStorage.getItem('userToken');
      if (token) {
        const userResponse = await axios.get(`${BASE_URL}/profile`, {
          withCredentials: true,
        });
        setUser(userResponse.data);
        localStorage.setItem('user', JSON.stringify(userResponse.data));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      localStorage.clear(); // Clear session storage on error
    }
    setLoading(false); // End loading 
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
        //setUser(response.data.user);
        localStorage.setItem('userToken', response.data.token); // Store the token
        await loadUserProfile(); // Load and store user profile
        //return response.data;
      } //else {
        //throw new Error(response.data.message);
      //}
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
        // Redirect to login after successful registration
        window.location.href = '/login';
      } //else {
        //throw new Error(response.data.message);
      //}
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