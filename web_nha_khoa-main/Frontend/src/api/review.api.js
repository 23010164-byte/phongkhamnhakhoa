import axiosClient from './axiosClient';

const reviewApi = {
  getAll: (params) => axiosClient.get('/reviews', { params }),

  getById: (id) => axiosClient.get(`/reviews/${id}`),

  create: (data) => axiosClient.post('/reviews', data),

  update: (id, data) => axiosClient.put(`/reviews/${id}`, data),

  remove: (id) => axiosClient.delete(`/reviews/${id}`),
};

export default reviewApi;
