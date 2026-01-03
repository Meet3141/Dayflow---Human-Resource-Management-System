import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const HRDashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h1 style={styles.logo}>Dayflow HRMS</h1>
          <div style={styles.userMenu}>
            <span>{user?.name}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div style={styles.content}>
        <h2>Welcome, {user?.name}! (HR Dashboard)</h2>
        <div style={styles.card}>
          <h3>HR Information</h3>
          <p><strong>Employee ID:</strong> {user?.employeeId}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          <p><strong>Department:</strong> {user?.department || 'HR'}</p>
        </div>

        <div style={styles.grid}>
          <div style={styles.gridCard}>
            <h4>👥 Employee Management</h4>
            <p>View and manage employee profiles</p>
          </div>
          <div style={styles.gridCard}>
            <h4>📋 Leave Requests</h4>
            <p>Review and approve leave applications</p>
          </div>
          <div style={styles.gridCard}>
            <h4>💰 Payroll</h4>
            <p>Process salary and payroll</p>
          </div>
          <div style={styles.gridCard}>
            <h4>📊 Attendance</h4>
            <p>Monitor employee attendance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  navbar: {
    backgroundColor: '#333',
    color: 'white',
    padding: '0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    margin: 0,
    fontSize: '24px',
  },
  userMenu: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginTop: '20px',
    marginBottom: '30px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  gridCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
};

export default HRDashboard;
