import React, { useState, useEffect } from 'react';
import { authAPI } from '../../services/authService';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '', dateOfBirth: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

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
      setMessage({ type: 'success', text: 'Profile updated' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Update failed' });
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <h2>My Profile</h2>
      {message && <div style={{ color: message.type === 'error' ? 'red' : 'green' }}>{message.text}</div>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <label>First name</label>
        <input name="firstName" value={form.firstName} onChange={handleChange} />

        <label>Last name</label>
        <input name="lastName" value={form.lastName} onChange={handleChange} />

        <label>Phone number</label>
        <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />

        <label>Date of birth</label>
        <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />

        <label>Password (leave empty to keep unchanged)</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} />

        <button type="submit">Save</button>
      </form>

      <div style={styles.card}>
        <h4>Profile details</h4>
        <p><strong>Email:</strong> {profile?.email}</p>
        <p><strong>Role:</strong> {profile?.role}</p>
        <p><strong>Department:</strong> {profile?.department}</p>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: 800, margin: '0 auto', padding: 20 },
  form: { display: 'grid', gap: 8, marginBottom: 20 },
  card: { background: '#fff', padding: 12, borderRadius: 6, boxShadow: '0 2px 6px rgba(0,0,0,0.06)' },
};

export default ProfilePage;