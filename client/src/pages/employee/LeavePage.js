import React, { useEffect, useState } from 'react';
import { leaveAPI } from '../../services/leaveService';

const LeavePage = () => {
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ leaveType: 'Sick', startDate: '', endDate: '', reason: '' });
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
    try {
      await leaveAPI.applyLeave(form);
      setMessage({ type: 'success', text: 'Leave applied' });
      setForm({ leaveType: 'Sick', startDate: '', endDate: '', reason: '' });
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
  const [editForm, setEditForm] = useState({ leaveType: 'Sick', startDate: '', endDate: '', reason: '' });

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

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <h2>My Leaves</h2>
      {message && <div style={{ color: message.type === 'error' ? 'red' : 'green' }}>{message.text}</div>}

      <form onSubmit={handleApply} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
        <label>Type</label>
        <select name="leaveType" value={form.leaveType} onChange={handleChange}>
          <option value="sick">Sick</option>
          <option value="casual">Casual</option>
          <option value="annual">Paid (Annual)</option>
          <option value="unpaid">Unpaid</option>
          <option value="maternity">Maternity</option>
          <option value="paternity">Paternity</option>
        </select>
        <label>Start</label>
        <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
        <label>End</label>
        <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
        <label>Reason</label>
        <textarea name="reason" value={form.reason} onChange={handleChange}></textarea>
        <button type="submit">Apply</button>
      </form>

      <div style={{ marginTop: 20 }}>
        <h3>Your applications</h3>
        <ul>
          {leaves.map((l) => (
            <li key={l._id} style={{ marginBottom: 12, background: '#fff', padding: 12, borderRadius: 6 }}>
              <div><strong>{l.leaveType}</strong> — {new Date(l.startDate).toDateString()} to {new Date(l.endDate).toDateString()}</div>
              <div><strong>Status:</strong> {l.status}</div>
              {l.status !== 'Pending' && l.reviewedBy && (
                <div><strong>Reviewed by:</strong> {l.reviewedBy.name} — <em>{l.comments}</em></div>
              )}

              {editingId === l._id ? null : (
                <div style={{ marginTop: 8 }}>
                  {l.status === 'Pending' && (
                    <>
                      <button onClick={() => startEdit(l)}>Edit</button>
                      <button onClick={() => handleCancel(l._id)} style={{ marginLeft: 8 }}>Cancel</button>
                    </>
                  )}
                </div>
              )}

              {editingId === l._id && (
                <form onSubmit={submitEdit} style={{ marginTop: 8, display: 'grid', gap: 8 }}>
                  <select name="leaveType" value={editForm.leaveType} onChange={handleEditChange}>
                    <option>Sick</option>
                    <option>Casual</option>
                    <option>Paid</option>
                  </select>
                  <input type="date" name="startDate" value={editForm.startDate} onChange={handleEditChange} />
                  <input type="date" name="endDate" value={editForm.endDate} onChange={handleEditChange} />
                  <textarea name="reason" value={editForm.reason} onChange={handleEditChange}></textarea>
                  <div>
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setEditingId(null)} style={{ marginLeft: 8 }}>Cancel</button>
                  </div>
                </form>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LeavePage;