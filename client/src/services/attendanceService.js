import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const attendanceAPI = {
  checkIn: async () => {
    const res = await axios.post(`${API_URL}/attendance/checkin`);
    return res.data.data;
  },

  checkOut: async () => {
    const res = await axios.post(`${API_URL}/attendance/checkout`);
    return res.data.data;
  },

  getMyAttendance: async ({ date, start, end } = {}) => {
    const params = {};
    if (date) params.date = date;
    if (start && end) {
      params.start = start;
      params.end = end;
    }
    const res = await axios.get(`${API_URL}/attendance/me`, { params });
    return res.data.data;
  },
};