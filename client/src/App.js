import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import HRDashboard from './pages/HRDashboard';
import './App.css';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard/employee" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard/employee" /> : <RegisterPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard/employee"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/hr"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <HRDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch All */}
      <Route path="/" element={user ? <Navigate to="/dashboard/employee" /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
