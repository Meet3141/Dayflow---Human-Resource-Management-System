import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const leaveAPI = {
  applyLeave: async (payload) => {
    const res = await axios.post(`${API_URL}/leaves`, payload);
    return res.data.data;
  },
  getMyLeaves: async () => {
    const res = await axios.get(`${API_URL}/leaves/my-leaves`);
    return res.data.data;
  },
  getAllLeaves: async (params = {}) => {
    const res = await axios.get(`${API_URL}/leaves`, { params });
    return res.data.data;
  },
  reviewLeave: async (leaveId, payload) => {
    const res = await axios.put(`${API_URL}/leaves/${leaveId}/review`, payload);
    return res.data.data;
  },
  cancelLeave: async (leaveId) => {
    const res = await axios.delete(`${API_URL}/leaves/${leaveId}`);
    return res.data;
  },
  updateLeave: async (leaveId, payload) => {
    const res = await axios.put(`${API_URL}/leaves/${leaveId}`, payload);
    return res.data.data;
  },
};