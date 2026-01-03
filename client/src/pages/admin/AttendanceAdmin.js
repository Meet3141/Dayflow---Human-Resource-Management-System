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
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Attendance Management</h2>
        <p style={styles.subtitle}>View all employee attendance records</p>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}
      
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Filter by Date Range</h3>
        <form onSubmit={fetchAttendance} style={styles.filterForm}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Start Date</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>End Date</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? '⏳ Loading...' : '🔍 Fetch Records'}
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Attendance Records</h3>
        {records.length === 0 ? (
          <p style={styles.noData}>No attendance records found. Select dates and fetch to view data.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.tableHeaderCell}>Date</th>
                  <th style={styles.tableHeaderCell}>Employee</th>
                  <th style={styles.tableHeaderCell}>Status</th>
                  <th style={styles.tableHeaderCell}>Check-in</th>
                  <th style={styles.tableHeaderCell}>Check-out</th>
                  <th style={styles.tableHeaderCell}>Hours</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id} style={styles.tableRow}>
                    <td style={styles.tableCell}>
                      {new Date(r.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.employeeName}>
                        {r.employee?.name || r.user?.name || 'N/A'}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      {getStatusBadge(r.status)}
                    </td>
                    <td style={styles.tableCell}>
                      {r.checkIn ? new Date(r.checkIn).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '-'}
                    </td>
                    <td style={styles.tableCell}>
                      {r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '-'}
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.hours}>
                        {r.durationHours ? `${r.durationHours.toFixed(2)}h` : '-'}
                      </span>
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

const getStatusBadge = (status) => {
  let bgColor = '#f3f4f6';
  let textColor = '#374151';

  switch(status?.toLowerCase()) {
    case 'present':
      bgColor = '#d1fae5';
      textColor = '#065f46';
      break;
    case 'absent':
      bgColor = '#fee2e2';
      textColor = '#991b1b';
      break;
    case 'half-day':
      bgColor = '#fef3c7';
      textColor = '#92400e';
      break;
    case 'leave':
      bgColor = '#cffafe';
      textColor = '#164e63';
      break;
    case 'holiday':
      bgColor = '#f3f4f6';
      textColor = '#374151';
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
      textTransform: 'uppercase'
    }}>
      {status}
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
    color: '#1f2937',
    margin: '0 0 20px 0',
  },
  filterForm: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    alignItems: 'flex-end',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'all 0.2s',
    outline: 'none',
  },
  submitBtn: {
    background: '#3b6f7f',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(59, 111, 127, 0.3)',
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
    color: '#1f2937',
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
    fontWeight: '500',
    color: '#1f2937',
  },
  hours: {
    fontWeight: '600',
    color: '#3b6f7f',
  },
  noData: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '32px 16px',
    fontSize: '14px',
  },
};

export default AttendanceAdmin;