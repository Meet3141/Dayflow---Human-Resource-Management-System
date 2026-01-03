import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/authService';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '', dateOfBirth: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await authAPI.getMe();
        setProfile(data);
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phoneNumber: data.phoneNumber || '',
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().slice(0, 10) : '',
          password: '',
        });
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const data = await authAPI.updateProfile(form);
      setProfile(data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setForm({ ...form, password: '' }); // Clear password field
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Update failed' });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setForm({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phoneNumber: profile.phoneNumber || '',
      dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : '',
      password: '',
    });
    setMessage(null);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Profile</h1>
          <p style={styles.subtitle}>Manage your personal information</p>
        </div>
        {!isEditing && (
          <button style={styles.editButton} onClick={() => setIsEditing(true)}>
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div style={message.type === 'error' ? styles.errorAlert : styles.successAlert}>
          <span style={styles.alertIcon}>{message.type === 'error' ? '⚠️' : '✓'}</span>
          {message.text}
        </div>
      )}

      <div style={styles.grid}>
        {/* Profile Overview Card */}
        <div style={styles.overviewCard}>
          <div style={styles.avatarSection}>
            <div style={styles.avatar}>
              {profile?.name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={styles.userInfo}>
              <h2 style={styles.userName}>{profile?.name || 'User'}</h2>
              <p style={styles.userEmail}>{profile?.email}</p>
              <span style={styles.roleBadge}>{profile?.role?.toUpperCase()}</span>
            </div>
          </div>

          <div style={styles.divider}></div>

          <div style={styles.infoSection}>
            <h3 style={styles.sectionTitle}>Employee Information</h3>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Employee ID</span>
                <span style={styles.infoValue}>{profile?.employeeId || 'N/A'}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Department</span>
                <span style={styles.infoValue}>{profile?.department || 'Not assigned'}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Position</span>
                <span style={styles.infoValue}>{profile?.position || 'Not assigned'}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Status</span>
                <span style={{...styles.infoValue, color: profile?.isActive ? '#10b981' : '#ef4444', fontWeight: '600'}}>
                  {profile?.isActive ? '● Active' : '● Inactive'}
                </span>
              </div>
              {profile?.hireDate && (
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Hire Date</span>
                  <span style={styles.infoValue}>
                    {new Date(profile.hireDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Form Card */}
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>
            {isEditing ? 'Edit Information' : 'Personal Details'}
          </h3>
          
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={isEditing ? styles.input : styles.inputDisabled}
                  placeholder="Enter first name"
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  style={isEditing ? styles.input : styles.inputDisabled}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                disabled={!isEditing}
                style={isEditing ? styles.input : styles.inputDisabled}
                placeholder="Enter phone number"
                type="tel"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Date of Birth</label>
              <input
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                disabled={!isEditing}
                style={isEditing ? styles.input : styles.inputDisabled}
              />
            </div>

            {isEditing && (
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Change Password
                  <span style={styles.optional}>(optional)</span>
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Leave empty to keep current password"
                />
              </div>
            )}

            {isEditing && (
              <div style={styles.buttonGroup}>
                <button type="submit" style={styles.saveButton}>
                  💾 Save Changes
                </button>
                <button type="button" onClick={handleCancel} style={styles.cancelButton}>
                  ✕ Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
    background: 'linear-gradient(135deg, #1a3a42 0%, #3b6f7f 100%)',
    minHeight: '100vh',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f4f6',
    borderTop: '5px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#6b7280',
    fontSize: '16px',
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
  editButton: {
    background: '#3b6f7f',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(59, 111, 127, 0.2)',
  },
  errorAlert: {
    background: '#fee2e2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  successAlert: {
    background: '#d1fae5',
    border: '1px solid #6ee7b7',
    color: '#065f46',
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  alertIcon: {
    fontSize: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '24px',
  },
  overviewCard: {
    background: '#fff',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  },
  avatarSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#3b6f7f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  userEmail: {
    color: '#6b7280',
    fontSize: '14px',
    margin: '0 0 12px 0',
  },
  roleBadge: {
    display: 'inline-block',
    background: '#3b6f7f',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  divider: {
    height: '1px',
    background: '#e5e7eb',
    margin: '24px 0',
  },
  infoSection: {
    marginTop: '24px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '20px',
  },
  infoGrid: {
    display: 'grid',
    gap: '16px',
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '8px',
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '500',
  },
  infoValue: {
    color: '#111827',
    fontSize: '14px',
    fontWeight: '600',
  },
  formCard: {
    background: '#fff',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(150px, 200px))',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  optional: {
    fontSize: '12px',
    fontWeight: '400',
    color: '#9ca3af',
    marginLeft: '4px',
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s',
    outline: 'none',
  },
  inputDisabled: {
    padding: '12px 16px',
    border: '2px solid #f3f4f6',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#f9fafb',
    color: '#6b7280',
    cursor: 'not-allowed',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  },
  saveButton: {
    flex: 1,
    background: '#3b6f7f',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(59, 111, 127, 0.3)',
  },
  cancelButton: {
    flex: 1,
    background: '#fff',
    color: '#6b7280',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default ProfilePage;