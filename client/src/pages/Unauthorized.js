import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: 16 }}>
      <h2>Access Denied</h2>
      <p>You do not have permission to view this page.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => navigate(-1)}>Go Back</button>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    </div>
  );
};

export default Unauthorized;
