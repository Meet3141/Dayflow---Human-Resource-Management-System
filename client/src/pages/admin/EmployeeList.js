import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);

  const load = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/users`);
      setEmployees(res.data.data || []);
    } catch (err) {
      // ignore for now
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 20 }}>
      <h2>Employee List</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8 }}>Name</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Role</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Department</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e) => (
            <tr key={e._id}>
              <td style={{ padding: 8 }}>{e.firstName} {e.lastName}</td>
              <td style={{ padding: 8 }}>{e.email}</td>
              <td style={{ padding: 8 }}>{e.role}</td>
              <td style={{ padding: 8 }}>{e.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;