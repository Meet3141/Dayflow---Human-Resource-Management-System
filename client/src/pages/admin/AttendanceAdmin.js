import React, { useState } from 'react';

const AttendanceAdmin = () => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [records, setRecords] = useState([]);

  const fetch = async (e) => {
    e.preventDefault();
    if (!start || !end) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/users?start=${start}&end=${end}`);
      const data = await res.json();
      setRecords(data.data || []);
    } catch (err) {
      // ignore
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <h2>Attendance (Admin)</h2>
      <form onSubmit={fetch} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        <button type="submit">Fetch</button>
      </form>

      <div>
        {records.length === 0 ? <p>No records</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr><th>Date</th><th>User</th><th>Status</th><th>Check-in</th><th>Check-out</th></tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td style={{ padding: 8 }}>{new Date(r.date).toDateString()}</td>
                  <td style={{ padding: 8 }}>{r.user?.firstName} {r.user?.lastName}</td>
                  <td style={{ padding: 8 }}>{r.status}</td>
                  <td style={{ padding: 8 }}>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '-'}</td>
                  <td style={{ padding: 8 }}>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '-'}</td>
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