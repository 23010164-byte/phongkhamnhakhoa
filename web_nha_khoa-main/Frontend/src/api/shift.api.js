import axiosClient from './axiosClient';

const shiftApi = {
  getShifts: (params = {}) => axiosClient.get('/shifts', { params }),
  getShiftById: (id) => axiosClient.get(`/shifts/${id}`),
  createShift: (data) => axiosClient.post('/shifts', data),
  updateShift: (id, data) => axiosClient.put(`/shifts/${id}`, data),
  deleteShift: (id) => axiosClient.delete(`/shifts/${id}`),
};
export default shiftApi;