import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const payrollAPI = {
  getMyPayroll: async (period) => {
    const params = {};
    if (period) params.period = period;
    const res = await axios.get(`${API_URL}/payroll/me`, { params });
    return res.data.data;
  },

  getUserPayroll: async (userId, period) => {
    const params = {};
    if (period) params.period = period;
    const res = await axios.get(`${API_URL}/payroll/users/${userId}`, { params });
    return res.data.data;
  },

  updateSalary: async (userId, payload) => {
    const res = await axios.put(`${API_URL}/payroll/users/${userId}`, payload);
    return res.data.data;
  },
};