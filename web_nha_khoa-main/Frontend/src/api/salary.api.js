import axiosClient from './axiosClient';

const salaryApi = {
  // ── Config ───────────────────────────────────────────────
  getConfig: () => axiosClient.get('/salaries/config'),
  updateConfig: (data) => axiosClient.put('/salaries/config', data),

  // ── Shift calculation (demo) ─────────────────────────────
  calculateShift: (data) => axiosClient.post('/salaries/calculate-shift', data),

  // ── Appointments / Complexity ────────────────────────────
  getAppointments: (params) => axiosClient.get('/salaries/appointments', { params }),
  updateComplexity: (id, data) => axiosClient.put(`/salaries/appointments/${id}/complexity`, data),

  // ── Salary slip ──────────────────────────────────────────
  generateSlip: (data) => axiosClient.post('/salaries/slips/generate', data),

  // ── Reports ──────────────────────────────────────────────
  getMonthlyReport: (params) => axiosClient.get('/salaries/reports/month', { params }),
  getDoctorYearlyReport: (params) => axiosClient.get('/salaries/reports/year/doctor', { params }),
  getAllDoctorsYearlyReport: (params) => axiosClient.get('/salaries/reports/year/all', { params }),

  // ── Doctors list ─────────────────────────────────────────
  getDoctors: () => axiosClient.get('/doctors'),
};

export default salaryApi;
