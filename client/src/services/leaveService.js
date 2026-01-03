import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const leaveAPI = {
  applyLeave: async (payload) => {
    try {
      const res = await axios.post(`${API_URL}/leaves`, payload);
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      throw new Error(message);
    }
  },
  getMyLeaves: async () => {
    try {
      const res = await axios.get(`${API_URL}/leaves/my-leaves`);
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      throw new Error(message);
    }
  },
  getAllLeaves: async (params = {}) => {
    try {
      const res = await axios.get(`${API_URL}/leaves`, { params });
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      throw new Error(message);
    }
  },
  reviewLeave: async (leaveId, payload) => {
    try {
      const res = await axios.put(`${API_URL}/leaves/${leaveId}/review`, payload);
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      throw new Error(message);
    }
  },
  cancelLeave: async (leaveId) => {
    try {
      const res = await axios.delete(`${API_URL}/leaves/${leaveId}`);
      return res.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      throw new Error(message);
    }
  },
  updateLeave: async (leaveId, payload) => {
    try {
      const res = await axios.put(`${API_URL}/leaves/${leaveId}`, payload);
      return res.data.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      throw new Error(message);
    }
  },
};