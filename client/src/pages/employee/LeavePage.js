import React, { useEffect, useState } from 'react';
import { leaveAPI } from '../../services/leaveService';

const LeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ leaveType: 'sick', startDate: '', endDate: '', reason: '' });
  const [message, setMessage] = useState(null);

  const load = async () => {
    try {
      const data = await leaveAPI.getMyLeaves();
      setLeaves(data || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load leaves' });
    }
  };

  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleApply = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!form.leaveType || !form.startDate || !form.endDate || !form.reason) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    
    if (start > end) {
      setMessage({ type: 'error', text: 'End date must be after start date' });
      return;
    }

    try {
      await leaveAPI.applyLeave(form);
      setMessage({ type: 'success', text: 'Leave applied successfully!' });
      setForm({ leaveType: 'sick', startDate: '', endDate: '', reason: '' });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Apply failed' });
    }
  };

  const handleCancel = async (leaveId) => {
    if (!window.confirm('Cancel this leave request?')) return;
    try {
      await leaveAPI.cancelLeave(leaveId);
      setMessage({ type: 'success', text: 'Leave cancelled' });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Cancel failed' });
    }
  };

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ leaveType: 'sick', startDate: '', endDate: '', reason: '' });

  const startEdit = (l) => {
    setEditingId(l._id);
    setEditForm({
      leaveType: l.leaveType,
      startDate: l.startDate ? new Date(l.startDate).toISOString().slice(0, 10) : '',
      endDate: l.endDate ? new Date(l.endDate).toISOString().slice(0, 10) : '',
      reason: l.reason || '',
    });
  };

  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      await leaveAPI.updateLeave(editingId, editForm);
      setMessage({ type: 'success', text: 'Leave updated' });
      setEditingId(null);
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Update failed' });
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved': return '#10b981';
      case 'Rejected': return '#ef4444';
      case 'Pending': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Leave Management</h1>
          <p style={styles.subtitle}>Apply and track your leave requests</p>
        </div>
      </div>

      {message && (
        <div style={message.type === 'error' ? styles.errorAlert : styles.successAlert}>
          <span style={styles.alertIcon}>{message.type === 'error' ? '⚠️' : '✓'}</span>
          {message.text}
        </div>
      )}

      <div style={styles.grid}>
        {/* Application Form */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Apply for Leave</h3>
          <form onSubmit={handleApply} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Leave Type</label>
              <select name="leaveType" value={form.leaveType} onChange={handleChange} style={styles.select}>
                <option value="sick">Sick Leave</option>
                <option value="casual">Casual Leave</option>
                <option value="annual">Paid (Annual)</option>
                <option value="unpaid">Unpaid Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
              </select>
            </div>

            <div style={styles.dateRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Start Date</label>
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>End Date</label>
                <input type="date" name="endDate" value={form.endDate} onChange={handleChange} style={styles.input} />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Reason</label>
              <textarea name="reason" value={form.reason} onChange={handleChange} style={styles.textarea} placeholder="Provide reason for leave..."></textarea>
            </div>

            <button type="submit" style={styles.submitButton}>📤 Submit Request</button>
          </form>
        </div>

        {/* Leave History */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Your Leave Applications</h3>
          {leaves.length === 0 ? (
            <p style={styles.emptyMessage}>No leave applications yet</p>
          ) : (
            <div style={styles.leavesList}>
              {leaves.map((l) => (
                <div key={l._id} style={styles.leaveItem}>
                  {editingId === l._id ? (
                    <form onSubmit={submitEdit} style={styles.editForm}>
                      <select name="leaveType" value={editForm.leaveType} onChange={handleEditChange} style={styles.select}>
                        <option>Sick</option>
                        <option>Casual</option>
                        <option>Paid</option>
                        <option>Unpaid</option>
                        <option>Maternity</option>
                        <option>Paternity</option>
                      </select>
                      <input type="date" name="startDate" value={editForm.startDate} onChange={handleEditChange} style={styles.input} />
                      <input type="date" name="endDate" value={editForm.endDate} onChange={handleEditChange} style={styles.input} />
                      <textarea name="reason" value={editForm.reason} onChange={handleEditChange} style={styles.textarea}></textarea>
                      <div style={styles.buttonGroup}>
                        <button type="submit" style={styles.saveButton}>💾 Save</button>
                        <button type="button" onClick={() => setEditingId(null)} style={styles.cancelButton}>✕ Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div style={styles.leaveHeader}>
                        <div>
                          <h4 style={styles.leaveType}>{l.leaveType.toUpperCase()}</h4>
                          <p style={styles.leaveDate}>
                            {new Date(l.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(l.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <span style={{...styles.statusBadge, background: getStatusColor(l.status)}}>
                          {l.status}
                        </span>
                      </div>

                      <div style={styles.leaveDetails}>
                        <p><strong>Reason:</strong> {l.reason}</p>
                        {l.status !== 'Pending' && l.reviewedBy && (
                          <p><strong>Reviewed by:</strong> {l.reviewedBy.name}</p>
                        )}
                        {l.comments && (
                          <p><strong>Comments:</strong> <em>{l.comments}</em></p>
                        )}
                      </div>

                      {l.status === 'Pending' && (
                        <div style={styles.leaveActions}>
                          <button onClick={() => startEdit(l)} style={styles.editButton}>✏️ Edit</button>
                          <button onClick={() => handleCancel(l._id)} style={styles.deleteButton}>🗑️ Cancel</button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
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
  header: {
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#fff',
    borderRadius: '24px',
    padding: '32px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  dateRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s',
    outline: 'none',
  },
  select: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
  },
  textarea: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '100px',
    outline: 'none',
    transition: 'all 0.2s',
  },
  submitButton: {
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
  leavesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  leaveItem: {
    background: '#f9fafb',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s',
  },
  leaveHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  leaveType: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 4px 0',
  },
  leaveDate: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  statusBadge: {
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  leaveDetails: {
    fontSize: '13px',
    color: '#374151',
    marginBottom: '12px',
  },
  leaveActions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    flex: 1,
    background: '#3b6f7f',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  deleteButton: {
    flex: 1,
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
  },
  saveButton: {
    flex: 1,
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cancelButton: {
    flex: 1,
    background: '#6b7280',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
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
  emptyMessage: {
    color: '#6b7280',
    textAlign: 'center',
    padding: '32px 16px',
    fontSize: '14px',
  },
};

export default LeavePage;