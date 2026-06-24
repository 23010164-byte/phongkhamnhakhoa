import axiosClient from './axiosClient';

const blogApi = {
  getAll: (params) => axiosClient.get('/blogs', { params }),

  getById: (id) => axiosClient.get(`/blogs/${id}`),

  create: (data) => axiosClient.post('/blogs', data),

  update: (id, data) => axiosClient.put(`/blogs/${id}`, data),

  remove: (id) => axiosClient.delete(`/blogs/${id}`),

  publish: (id) => axiosClient.patch(`/blogs/${id}/publish`),
};

export default blogApi;
