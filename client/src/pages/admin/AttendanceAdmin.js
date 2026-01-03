import React, { useState } from 'react';
import { attendanceAPI } from '../../services/attendanceService';

const AttendanceAdmin = () => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttendance = async (e) => {
    e.preventDefault();
    if (!start || !end) {
      setError('Please select both start and end dates');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceAPI.getAllAttendance({ start, end });
      setRecords(data || []);
    } catch (err) {
      console.error('Attendance fetch error', err);
      setError(err.message || 'Failed to fetch attendance records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <h2>Attendance (Admin)</h2>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      
      <form onSubmit={fetchAttendance} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Fetch'}
        </button>
      </form>

      <div>
        {records.length === 0 ? <p>No records</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: 8, textAlign: 'left', borderBottom: '2px solid #ddd' }}>Date</th>
                <th style={{ padding: 8, textAlign: 'left', borderBottom: '2px solid #ddd' }}>Employee</th>
                <th style={{ padding: 8, textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                <th style={{ padding: 8, textAlign: 'left', borderBottom: '2px solid #ddd' }}>Check-in</th>
                <th style={{ padding: 8, textAlign: 'left', borderBottom: '2px solid #ddd' }}>Check-out</th>
                <th style={{ padding: 8, textAlign: 'left', borderBottom: '2px solid #ddd' }}>Hours</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                    {new Date(r.date).toDateString()}
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                    {r.employee?.name || r.user?.name || 'N/A'}
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      background: r.status === 'Present' ? '#e8f5e9' : '#fff3e0',
                      color: r.status === 'Present' ? '#2e7d32' : '#f57c00'
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                    {r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '-'}
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                    {r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '-'}
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                    {r.durationHours ? `${r.durationHours.toFixed(2)}h` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendanceAdmin;