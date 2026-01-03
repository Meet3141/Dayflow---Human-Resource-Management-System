import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EmployeeDashboard from './pages/EmployeeDashboard';
import HRDashboard from './pages/HRDashboard';
import ProfilePage from './pages/employee/ProfilePage';
import AttendancePage from './pages/employee/AttendancePage';
import LeavePage from './pages/employee/LeavePage';
import PayrollPage from './pages/employee/PayrollPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeList from './pages/admin/EmployeeList';
import AttendanceAdmin from './pages/admin/AttendanceAdmin';
import LeaveApprovals from './pages/admin/LeaveApprovals';
import PayrollAdmin from './pages/admin/PayrollAdmin';
import Unauthorized from './pages/Unauthorized';
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

  const defaultDashboard = user
    ? user.role === 'admin' || user.role === 'manager'
      ? '/dashboard/admin'
      : user.role === 'hr'
      ? '/dashboard/hr'
      : '/dashboard/employee'
    : '/login';

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to={defaultDashboard} /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={defaultDashboard} /> : <RegisterPage />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard/employee"
        element={
          <ProtectedRoute allowedRoles={['employee','admin','manager']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<div style={{ padding: 20 }}><p>Select a section from the left to view details.</p></div>} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="leaves" element={<LeavePage />} />
        <Route path="payroll" element={<PayrollPage />} />
      </Route>

      <Route
        path="/dashboard/hr"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <HRDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<div style={{ padding: 20 }}><p>Select an HR area.</p></div>} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="leaves" element={<LeaveApprovals />} />
        <Route path="attendance" element={<AttendanceAdmin />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={['admin','manager']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<div style={{ padding: 20 }}><p>Select an admin area.</p></div>} />
        <Route path="employees" element={<EmployeeList />} />
        <Route path="attendance" element={<AttendanceAdmin />} />
        <Route path="leaves" element={<LeaveApprovals />} />
        <Route path="payroll" element={<PayrollAdmin />} />
      </Route>

      {/* Unauthorized route */}
      <Route path="/unauthorized" element={<Unauthorized />} />

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
