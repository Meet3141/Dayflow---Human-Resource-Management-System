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
      <Route path="/dashboard/employee/profile" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /><ProfilePage /></ProtectedRoute>} />
      <Route path="/dashboard/employee/attendance" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /><AttendancePage /></ProtectedRoute>} />
      <Route path="/dashboard/employee/leaves" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /><LeavePage /></ProtectedRoute>} />
      <Route path="/dashboard/employee/payroll" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeDashboard /><PayrollPage /></ProtectedRoute>} />

      <Route
        path="/dashboard/hr"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <HRDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/dashboard/admin/employees" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /><EmployeeList /></ProtectedRoute>} />
      <Route path="/dashboard/admin/attendance" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /><AttendanceAdmin /></ProtectedRoute>} />
      <Route path="/dashboard/admin/leaves" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /><LeaveApprovals /></ProtectedRoute>} />
      <Route path="/dashboard/admin/payroll" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /><PayrollAdmin /></ProtectedRoute>} />

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
