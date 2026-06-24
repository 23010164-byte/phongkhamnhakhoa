import axiosClient from './axiosClient';

const leaveApi = {
  getAll: (params) => {
    return axiosClient.get('/leaves', { params });
  },

  create: (data) => {
    return axiosClient.post('/leaves', data);
  },

  updateStatus: (id, data) => {
    return axiosClient.put(`/leaves/${id}/status`, data);
  },
};

export default leaveApi;
