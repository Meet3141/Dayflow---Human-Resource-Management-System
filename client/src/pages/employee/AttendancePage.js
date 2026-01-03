import React, { useEffect, useState } from 'react';
import { attendanceAPI } from '../../services/attendanceService';

const AttendancePage = () => {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const loadToday = async () => {
    setLoading(true);
    try {
      const data = await attendanceAPI.getMyAttendance();
      setRecord(data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load attendance' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadToday();
  }, []);

  const handleCheckIn = async () => {
    setMessage(null);
    try {
      const res = await attendanceAPI.checkIn();
      setRecord(res);
      setMessage({ type: 'success', text: 'Checked in' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Check-in failed' });
    }
  };

  const handleCheckOut = async () => {
    setMessage(null);
    try {
      const res = await attendanceAPI.checkOut();
      setRecord(res);
      setMessage({ type: 'success', text: 'Checked out' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Check-out failed' });
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <h2>Attendance</h2>
      {message && <div style={{ color: message.type === 'error' ? 'red' : 'green' }}>{message.text}</div>}

      <div style={{ marginTop: 12 }}>
        <p><strong>Date:</strong> {record?.date ? new Date(record.date).toDateString() : 'N/A'}</p>
        <p><strong>Check-in:</strong> {record?.checkIn ? new Date(record.checkIn).toLocaleTimeString() : 'Not checked in'}</p>
        <p><strong>Check-out:</strong> {record?.checkOut ? new Date(record.checkOut).toLocaleTimeString() : 'Not checked out'}</p>
        <p><strong>Status:</strong> {record?.status || 'N/A'}</p>
        <p><strong>Hours:</strong> {record?.durationHours ?? 'N/A'}</p>

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button onClick={handleCheckIn} disabled={!!record?.checkIn}>Check In</button>
          <button onClick={handleCheckOut} disabled={!record?.checkIn || !!record?.checkOut}>Check Out</button>
          <button onClick={loadToday}>Refresh</button>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;