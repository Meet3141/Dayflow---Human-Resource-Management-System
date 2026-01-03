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

  const [reviewingId, setReviewingId] = React.useState(null);
  const [reviewComments, setReviewComments] = React.useState('');

  const handleStartReview = (id) => {
    setReviewingId(id);
    setReviewComments('');
  };

  const handleCancelReview = () => {
    setReviewingId(null);
    setReviewComments('');
  };

  const handleReview = async (id, status) => {
    try {
      await leaveAPI.reviewLeave(id, { status, comments: reviewComments });
      setReviewingId(null);
      setReviewComments('');
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
                  reviewingId === l._id ? (
                    <div style={{ display: 'grid', gap: 8 }}>
                      <textarea placeholder="Comments (optional)" value={reviewComments} onChange={(e) => setReviewComments(e.target.value)} />
                      <div>
                        <button onClick={() => handleReview(l._id, 'Approved')}>Approve</button>
                        <button onClick={() => handleReview(l._id, 'Rejected')} style={{ marginLeft: 8 }}>Reject</button>
                        <button onClick={handleCancelReview} style={{ marginLeft: 8 }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => handleStartReview(l._id)}>Review</button>
                  )
                )}

                {l.status !== 'Pending' && l.reviewedBy && (
                  <div>
                    <div><strong>{l.status}</strong> by {l.reviewedBy.name}</div>
                    {l.comments && <div><em>{l.comments}</em></div>}
                  </div>
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