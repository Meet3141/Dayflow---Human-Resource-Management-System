import React, { useEffect, useState } from 'react';
import { leaveAPI } from '../../services/leaveService';

const LeaveApprovals = () => {
  const [leaves, setLeaves] = useState([]);

  const load = async () => {
    try {
      const data = await leaveAPI.getAllLeaves();
      setLeaves(data || []);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => { load(); }, []);

  const handleReview = async (id, status) => {
    try {
      await leaveAPI.reviewLeave(id, { status });
      load();
    } catch (err) {
      alert('Failed');
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <h2>Leave Approvals</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Employee</th><th>Type</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {leaves.map((l) => (
            <tr key={l._id}>
              <td style={{ padding: 8 }}>{l.employee?.firstName} {l.employee?.lastName}</td>
              <td style={{ padding: 8 }}>{l.leaveType}</td>
              <td style={{ padding: 8 }}>{new Date(l.startDate).toDateString()}</td>
              <td style={{ padding: 8 }}>{new Date(l.endDate).toDateString()}</td>
              <td style={{ padding: 8 }}>{l.status}</td>
              <td style={{ padding: 8 }}>
                {l.status === 'Pending' && (
                  <>
                    <button onClick={() => handleReview(l._id, 'Approved')}>Approve</button>
                    <button onClick={() => handleReview(l._id, 'Rejected')}>Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveApprovals;