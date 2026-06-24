import axiosClient from './axiosClient';

const rosterApi = {
  getRosters: (params = {}) => axiosClient.get('/rosters', { params }),
  getRosterById: (id) => axiosClient.get(`/rosters/${id}`),
  createRoster: (data) => axiosClient.post('/rosters', data),
  approveRoster: (id) => axiosClient.patch(`/rosters/${id}/approve`),
  rejectRoster: (id) => axiosClient.patch(`/rosters/${id}/reject`),
  deleteRoster: (id) => axiosClient.delete(`/rosters/${id}`),
  getAvailableDoctors: (params = {}) => axiosClient.get('/rosters/available-doctors', { params }),
};
export default rosterApi;