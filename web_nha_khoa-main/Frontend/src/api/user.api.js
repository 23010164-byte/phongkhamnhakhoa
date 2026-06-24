import axiosClient from './axiosClient';

const userApi = {
  // ── Profile ──────────────────────────────────────────────────────────────
  getProfile: () =>
    axiosClient.get('/users/profile'),

  updateProfile: (data) =>
    axiosClient.put('/users/profile', data),

  updateAvatar: (formData) =>
    axiosClient.put('/users/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  changePassword: (data) =>
    axiosClient.put('/auth/change-password', data),

  // ── Admin – User list ─────────────────────────────────────────────────────
  getUsers: (params) =>
    axiosClient.get('/users', { params }),
  // params: { page, limit, search, role, status }

  // ── Receptionist – Patient list ────────────────────────────────────────────
  getPatients: (params) =>
    axiosClient.get('/users/patients', { params }),

  // ── Admin – User detail ───────────────────────────────────────────────────
  getUserById: (id) =>
    axiosClient.get(`/users/${id}`),

  updateUser: (id, data) =>
    axiosClient.put(`/users/${id}`, data),

  deleteUser: (id) =>
    axiosClient.delete(`/users/${id}`),

  toggleUserStatus: (id) =>
    axiosClient.patch(`/users/${id}/toggle-status`),

  // ── Receptionist – Create patient ──────────────────────────────────────────
  createPatient: (data) =>
    axiosClient.post('/users', data),

  // ── Admin / Receptionist – Generic User Creation ───────────────────────────
  createUser: (data) =>
    axiosClient.post('/users', data),
};

export default userApi;
