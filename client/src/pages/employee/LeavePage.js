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

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <h2>My Leaves</h2>
      {message && <div style={{ color: message.type === 'error' ? 'red' : 'green' }}>{message.text}</div>}

      <form onSubmit={handleApply} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
        <label>Type</label>
        <select name="leaveType" value={form.leaveType} onChange={handleChange}>
          <option>Sick</option>
          <option>Casual</option>
          <option>Paid</option>
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
            <li key={l._id}>{l.leaveType} — {new Date(l.startDate).toDateString()} to {new Date(l.endDate).toDateString()} — {l.status}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LeavePage;