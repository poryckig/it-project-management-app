import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavbarComponent from './Components/NavbarComponent/NavbarComponent';
import Home from './Components/Home/Home';
import Profile from './Components/Profile/Profile';
import LoginComponent from './Components/Auth/LoginComponent';
import RegisterComponent from './Components/Auth/RegisterComponent';
import './App.css';

const App = () => {
  const AppContent = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return (
      <div className="bg-gray-50">
        <Routes>
          {/* Public routes */}
          {!user && <Route path="/login" element={<LoginComponent />} />}
          {!user && <Route path="/register" element={<RegisterComponent />} />}

          {/* Private routes */}
          {user && <Route path="/" element={<Home />} />}
          {user && <Route path="/profile" element={<Profile />} />}

          {/* Redirect to login if not logged in */}
          <Route path="*" element={user ? <Navigate to="/" /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    );
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <NavbarComponent />
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;