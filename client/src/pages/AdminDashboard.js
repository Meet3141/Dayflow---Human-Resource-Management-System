import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const handleLogout = () => { logout(); window.location.href = '/login'; };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <h1 style={styles.logo}>Dayflow HRMS - Admin</h1>
          <div style={styles.userMenu}>
            <span>{user?.name}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </nav>

      <div style={styles.content}>
        <h2>Admin Dashboard</h2>
        <div style={styles.grid}>
          <Link to="/dashboard/admin/employees" style={styles.cardLink}><div style={styles.gridCard}><h4>👥 Employees</h4><p>View employee list</p></div></Link>
          <Link to="/dashboard/admin/attendance" style={styles.cardLink}><div style={styles.gridCard}><h4>📊 Attendance</h4><p>View attendance</p></div></Link>
          <Link to="/dashboard/admin/leaves" style={styles.cardLink}><div style={styles.gridCard}><h4>📋 Leave Approvals</h4><p>Review pending leaves</p></div></Link>
          <Link to="/dashboard/admin/payroll" style={styles.cardLink}><div style={styles.gridCard}><h4>💰 Payroll</h4><p>Manage salaries</p></div></Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f5f5f5' },
  navbar: { backgroundColor: '#222', color: '#fff', padding: 0 },
  navContent: { maxWidth: 1200, margin: '0 auto', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { margin: 0 },
  userMenu: { display: 'flex', gap: 12, alignItems: 'center' },
  logoutBtn: { padding: '8px 12px', background: '#667eea', color: '#fff', border: 'none', borderRadius: 4 },
  content: { maxWidth: 1200, margin: '0 auto', padding: 20 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 },
  gridCard: { background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardLink: { textDecoration: 'none', color: 'inherit' },
};

export default AdminDashboard;