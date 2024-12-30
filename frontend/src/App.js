import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavbarComponent from './Components/NavbarComponent/NavbarComponent';
import Home from './Components/Home/Home';
import Profile from './Components/Profile/Profile';
import LoginComponent from './Components/Auth/LoginComponent';
import RegisterComponent from './Components/Auth/RegisterComponent';
import ProjectDetails from './Components/ProjectDetails/ProjectDetails';
import Synopsis from './Components/Synopsis/Synopsis';
import CaseStudy from './Components/CaseStudy/CaseStudy';
import ProjectStatutes from './Components/ProjectStatutes/ProjectStatutes';
import RAMatrix from './Components/RAMatrix/RAMatrix';
import Tasks from './Components/Tasks/Tasks';
import TaskDetails from './Components/TaskDetails/TaskDetails';
import ProjectSettings from './Components/ProjectSettings/ProjectSettings';
import './App.css';

const App = () => {
  const AppContent = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return (
      <div className="bg-gray-50">
        <Routes>
          {!user && <Route path="/login" element={<LoginComponent />} />}
          {!user && <Route path="/register" element={<RegisterComponent />} />}

          {user && <Route path="/" element={<Home />} />}
          {user && <Route path="/profile" element={<Profile />} />}

          <Route path="/projects/:projectId" element={<ProjectDetails />}>
            <Route path="synopsis" element={<Synopsis />} />
            <Route path="case-study" element={<CaseStudy />} />
            <Route path="statut" element={<ProjectStatutes />} />
            <Route path="ram" element={<RAMatrix />} />
            <Route path="zadania" element={<Tasks />} />
            <Route path="tasks/:taskId" element={<TaskDetails />} />
            <Route path="ustawienia" element={<ProjectSettings />} />
          </Route>

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