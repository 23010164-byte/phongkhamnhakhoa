import axiosClient from './axiosClient';

const holidayApi = {
  getHolidays: (params = {}) => axiosClient.get('/holidays', { params }),
  getHolidayById: (id) => axiosClient.get(`/holidays/${id}`),
  createHoliday: (data) => axiosClient.post('/holidays', data),
  updateHoliday: (id, data) => axiosClient.put(`/holidays/${id}`, data),
  deleteHoliday: (id) => axiosClient.delete(`/holidays/${id}`),
};
export default holidayApi;