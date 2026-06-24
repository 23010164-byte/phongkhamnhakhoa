import axiosClient from './axiosClient';

const doctorApi = {
  // ── Public ────────────────────────────────────────────────────────────────
  /** GET /doctors?page&limit&search&specialty&status */
  getDoctors: (params) => axiosClient.get('/doctors', { params }),

  /** GET /doctors/:id */
  getDoctorById: (id) => axiosClient.get(`/doctors/${id}`),

  /** GET /doctors/:id/slots?date=YYYY-MM-DD */
  getDoctorSlots: (id, date) =>
    axiosClient.get(`/doctors/${id}/slots`, { params: { date } }),

  /** GET /specialties  – for filter dropdown */
  getSpecialties: () => axiosClient.get('/specialties'),

  // ── Doctor (own profile) ──────────────────────────────────────────────────
  /** GET /doctors/me/profile */
  getMyProfile: () => axiosClient.get('/doctors/me/profile'),

  /** PUT /doctors/me/profile */
  updateMyProfile: (data) => axiosClient.put('/doctors/me/profile', data),

  // ── Schedule ──────────────────────────────────────────────────────────────
  /** GET /doctors/me/schedule?from=YYYY-MM-DD&to=YYYY-MM-DD */
  getMySchedule: (from, to) =>
    axiosClient.get('/doctors/me/schedule', { params: { from, to } }),

  /** POST /doctors/me/schedule  – add / update slots for a day */
  upsertSchedule: (data) => axiosClient.post('/doctors/me/schedule', data),

  /** DELETE /doctors/me/schedule/:slotId */
  deleteSlot: (slotId) => axiosClient.delete(`/doctors/me/schedule/${slotId}`),

  // ── Admin ─────────────────────────────────────────────────────────────────
  /** POST /doctors */
  createDoctorProfile: (data) => axiosClient.post('/doctors', data),

  /** GET /admin/doctors/:id/schedule?from&to */
  getScheduleByDoctorId: (id, from, to) =>
    axiosClient.get(`/admin/doctors/${id}/schedule`, { params: { from, to } }),

  /** PUT /doctors/:id */
  updateDoctorProfile: (id, data) => axiosClient.put(`/doctors/${id}`, data),
};

export default doctorApi;
