import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    position: '',
    phoneNumber: '',
  });

  const load = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/users`);
      setEmployees(res.data.data || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load employees' });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (editingId) {
        // Update
        const { password, ...updateData } = formData;
        await axios.put(`${API_URL}/auth/users/${editingId}`, updateData);
        setMessage({ type: 'success', text: 'Employee updated successfully!' });
      } else {
        // Create
        if (!formData.password) {
          setMessage({ type: 'error', text: 'Password is required for new employees' });
          setLoading(false);
          return;
        }
        await axios.post(`${API_URL}/auth/register`, formData);
        setMessage({ type: 'success', text: 'Employee created successfully!' });
      }
      
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        department: '',
        position: '',
        phoneNumber: '',
      });
      setEditingId(null);
      setShowForm(false);
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    console.log('Editing employee:', employee);
    const newFormData = {
      name: employee.name ? String(employee.name).trim() : '',
      email: employee.email ? String(employee.email).trim() : '',
      password: '',
      role: employee.role ? String(employee.role).trim() : 'employee',
      department: employee.department ? String(employee.department).trim() : '',
      position: employee.position ? String(employee.position).trim() : '',
      phoneNumber: employee.phoneNumber ? String(employee.phoneNumber).trim() : '',
    };
    console.log('Setting form data:', newFormData);
    setFormData(newFormData);
    setEditingId(employee._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/auth/users/${id}`);
      setMessage({ type: 'success', text: 'Employee deleted successfully!' });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete employee' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      department: '',
      position: '',
      phoneNumber: '',
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Employee Management</h2>
          <p style={styles.subtitle}>Create, update, and manage employee records</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={styles.addButton}>
            ➕ Add Employee
          </button>
        )}
      </div>

      {message && (
        <div style={message.type === 'error' ? styles.errorAlert : styles.successAlert}>
          <span style={styles.alertIcon}>{message.type === 'error' ? '⚠️' : '✓'}</span>
          {message.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>{editingId ? 'Edit Employee' : 'Create New Employee'}</h3>
          <form onSubmit={handleCreate} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                  placeholder="e.g., John Doe"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Position</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <select name="role" value={formData.role} onChange={handleChange} style={styles.select}>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {!editingId && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    style={styles.input}
                    required={!editingId}
                    placeholder="Min 8 characters"
                  />
                </div>
              )}
            </div>

            <div style={styles.buttonGroup}>
              <button type="submit" disabled={loading} style={styles.submitButton}>
                {loading ? '⏳ Saving...' : editingId ? '💾 Update Employee' : '✅ Create Employee'}
              </button>
              <button type="button" onClick={handleCancel} style={styles.cancelButton}>
                ✕ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Employee List */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Employees ({employees.length})</h3>
        {employees.length === 0 ? (
          <p style={styles.noData}>No employees found. Create one to get started.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.tableHeaderCell}>Name</th>
                  <th style={styles.tableHeaderCell}>Email</th>
                  <th style={styles.tableHeaderCell}>Role</th>
                  <th style={styles.tableHeaderCell}>Department</th>
                  <th style={styles.tableHeaderCell}>Position</th>
                  <th style={styles.tableHeaderCell}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e._id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      <span style={styles.employeeName}>
                        {e.name || e.email}
                      </span>
                    </td>
                    <td style={styles.tableCell}>{e.email}</td>
                    <td style={styles.tableCell}>
                      {getRoleBadge(e.role)}
                    </td>
                    <td style={styles.tableCell}>{e.department || '-'}</td>
                    <td style={styles.tableCell}>{e.position || '-'}</td>
                    <td style={styles.tableCell}>
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => handleEdit(e)}
                          style={styles.editBtn}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(e._id)}
                          style={styles.deleteBtn}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const getRoleBadge = (role) => {
  let bgColor = '#f3f4f6';
  let textColor = '#374151';

  switch (role?.toLowerCase()) {
    case 'admin':
      bgColor = '#fee2e2';
      textColor = '#991b1b';
      break;
    case 'hr':
      bgColor = '#fef3c7';
      textColor = '#92400e';
      break;
    case 'manager':
      bgColor = '#dbeafe';
      textColor = '#1e40af';
      break;
    case 'employee':
      bgColor = '#d1fae5';
      textColor = '#065f46';
      break;
    default:
      break;
  }

  return (
    <span style={{
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      background: bgColor,
      color: textColor,
      textTransform: 'capitalize'
    }}>
      {role}
    </span>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 24px',
    background: 'linear-gradient(135deg, #1a3a42 0%, #3b6f7f 100%)',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#fff',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: '#e8ecf0',
    fontSize: '16px',
    margin: 0,
  },
  addButton: {
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.07)',
    border: '1px solid #e5e7eb',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a3a42',
    margin: '0 0 20px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a3a42',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'all 0.2s',
    outline: 'none',
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    background: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  },
  submitButton: {
    flex: 1,
    background: '#3b6f7f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(59, 111, 127, 0.3)',
  },
  cancelButton: {
    flex: 1,
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  errorAlert: {
    background: '#fee2e2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  successAlert: {
    background: '#d1fae5',
    border: '1px solid #6ee7b7',
    color: '#065f46',
    padding: '12px 16px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  alertIcon: {
    fontSize: '18px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  tableHeader: {
    background: '#f9fafb',
    borderBottom: '2px solid #e5e7eb',
  },
  tableHeaderCell: {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#1a3a42',
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'all 0.2s',
  },
  tableCell: {
    padding: '12px 16px',
    color: '#4b5563',
  },
  employeeName: {
    fontWeight: '600',
    color: '#1a3a42',
    fontSize: '15px',
    display: 'block',
    minWidth: '150px',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  editBtn: {
    background: '#3b6f7f',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  deleteBtn: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  noData: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '32px 16px',
    fontSize: '14px',
  },
};

export default EmployeeList;
