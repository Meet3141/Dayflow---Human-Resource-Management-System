import React, { useEffect, useState } from 'react';
import { attendanceAPI } from '../../services/attendanceService';
import { useAuth } from '../../contexts/AuthContext';
import './AttendancePage.css';

const AttendancePage = () => {
  const { user } = useAuth();
  const [todayRecord, setTodayRecord] = useState(null);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [viewMode, setViewMode] = useState('daily'); // daily or weekly

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await attendanceAPI.getMyAttendance();
      
      // Separate today's record and list
      const today = new Date().toDateString();
      const todayData = Array.isArray(data) 
        ? data.find(record => new Date(record.date).toDateString() === today)
        : data;
      
      setTodayRecord(todayData || null);
      setAttendanceList(Array.isArray(data) ? data : [data].filter(Boolean));
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load attendance' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = async () => {
    setMessage(null);
    try {
      const res = await attendanceAPI.checkIn();
      setTodayRecord(res);
      setMessage({ type: 'success', text: 'Checked in successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Check-in failed' });
    }
  };

  const handleCheckOut = async () => {
    setMessage(null);
    try {
      const res = await attendanceAPI.checkOut();
      setTodayRecord(res);
      setMessage({ type: 'success', text: 'Checked out successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Check-out failed' });
    }
  };

  const formatTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getWeeklyData = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const weekData = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const attendance = attendanceList.find(
        (a) =>
          new Date(a.date).toDateString() === date.toDateString()
      );
      weekData.push({
        date,
        attendance,
      });
    }
    return weekData;
  };

  const weeklyData = getWeeklyData();

  if (loading) {
    return <div className="attendance-container"><p>Loading attendance data...</p></div>;
  }

  return (
    <div className="attendance-container">
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Check-in/Check-out Section */}
      <div className="attendance-card">
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ margin: '0 0 4px 0' }}>Today's Attendance</h3>
          {user && (
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Employee: <strong>{user.firstName} {user.lastName}</strong>
            </p>
          )}
        </div>
        <div className="checkin-section">
          <div className="info-message" style={{ 
            background: '#e3f2fd', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            color: '#1976d2',
            fontSize: '14px'
          }}>
            ℹ️ <strong>Note:</strong> Check-in happens automatically when you log in, and check-out happens when you log out.
          </div>
          
          <div className="time-display">
            <div className="time-item">
              <span className="label">Check-in Time</span>
              <span className="time">
                {todayRecord?.checkIn ? formatTime(todayRecord.checkIn) : 'Not checked in'}
              </span>
            </div>
            <div className="divider"></div>
            <div className="time-item">
              <span className="label">Check-out Time</span>
              <span className="time">
                {todayRecord?.checkOut ? formatTime(todayRecord.checkOut) : 'Not checked out'}
              </span>
            </div>
          </div>

          <div className="working-hours">
            <span className="label">Working Hours</span>
            <span className="hours">
              {todayRecord?.durationHours ? `${todayRecord.durationHours.toFixed(2)} hrs` : '0 hrs'}
            </span>
          </div>

          <div className="action-buttons">
            <button
              onClick={handleCheckIn}
              disabled={loading || !!todayRecord?.checkIn}
              className="btn btn-checkin"
              style={{ opacity: 0.6 }}
              title="Manual check-in (automatic on login)"
            >
              {todayRecord?.checkIn ? '✓ Checked In' : 'Manual Check In'}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={loading || !todayRecord?.checkIn || !!todayRecord?.checkOut}
              className="btn btn-checkout"
              style={{ opacity: 0.6 }}
              title="Manual check-out (automatic on logout)"
            >
              {todayRecord?.checkOut ? '✓ Checked Out' : 'Manual Check Out'}
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="view-toggle">
        <button
          className={`toggle-btn ${viewMode === 'daily' ? 'active' : ''}`}
          onClick={() => setViewMode('daily')}
        >
          📅 Daily View
        </button>
        <button
          className={`toggle-btn ${viewMode === 'weekly' ? 'active' : ''}`}
          onClick={() => setViewMode('weekly')}
        >
          📊 Weekly View
        </button>
      </div>

      {/* Daily View */}
      {viewMode === 'daily' && (
        <div className="attendance-card">
          <h3>Daily Attendance Records</h3>
          <div className="attendance-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Hours</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendanceList.length > 0 ? (
                  attendanceList.map((record, idx) => (
                    <tr key={idx}>
                      <td>{formatDate(record.date)}</td>
                      <td>
                        <span className={`status ${record.status.toLowerCase().replace('-', '')}`}>
                          {record.status}
                        </span>
                      </td>
                      <td>{formatTime(record.checkIn)}</td>
                      <td>{formatTime(record.checkOut)}</td>
                      <td>{record.durationHours ? `${record.durationHours.toFixed(2)}h` : '-'}</td>
                      <td>{record.notes || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: '#999' }}>
                      No attendance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Weekly View */}
      {viewMode === 'weekly' && (
        <div className="attendance-card">
          <h3>Weekly Attendance Summary</h3>
          <div className="weekly-grid">
            {weeklyData.map((day, idx) => (
              <div key={idx} className="day-card">
                <div className="day-header">
                  <span className="day-name">
                    {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="day-date">{day.date.getDate()}</span>
                </div>
                <div className="day-body">
                  {day.attendance ? (
                    <>
                      <div className={`status-badge ${day.attendance.status.toLowerCase().replace('-', '')}`}>
                        {day.attendance.status}
                      </div>
                      <div className="time-info">
                        <p>
                          <strong>In:</strong>{' '}
                          {day.attendance.checkIn
                            ? formatTime(day.attendance.checkIn)
                            : '-'}
                        </p>
                        <p>
                          <strong>Out:</strong>{' '}
                          {day.attendance.checkOut
                            ? formatTime(day.attendance.checkOut)
                            : '-'}
                        </p>
                        <p>
                          <strong>Hours:</strong>{' '}
                          {day.attendance.durationHours
                            ? `${day.attendance.durationHours.toFixed(1)}h`
                            : '-'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div style={{ color: '#999', textAlign: 'center' }}>No record</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;