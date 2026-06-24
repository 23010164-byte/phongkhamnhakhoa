import axiosClient from './axiosClient';

const serviceApi = {
  // ── Public ────────────────────────────────────────────────────────────────
  /** GET /services?page&limit&search&category */
  getServices: (params) => axiosClient.get('/services', { params }),

  /** GET /services/:id */
  getServiceById: (id) => axiosClient.get(`/services/${id}`),

  /** GET /specialties */
  getCategories: () => axiosClient.get('/specialties'),

  // ── Admin ─────────────────────────────────────────────────────────────────
  /** POST /services */
  createService: (data) => axiosClient.post('/services', data),

  /** PUT /services/:id */
  updateService: (id, data) => axiosClient.put(`/services/${id}`, data),

  /** DELETE /services/:id */
  deleteService: (id) => axiosClient.delete(`/services/${id}`),

  /** PATCH /services/:id/toggle-status */
  toggleServiceStatus: (id) => axiosClient.patch(`/services/${id}/toggle-status`),
};

export default serviceApi;
