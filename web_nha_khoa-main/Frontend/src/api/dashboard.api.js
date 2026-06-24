import axiosClient from './axiosClient';

const dashboardApi = {
  // Admin
  getAdminDashboard: (params) => axiosClient.get('/dashboard/admin', { params }),

  // Doctor
  getDoctorDashboard: (params) => axiosClient.get('/dashboard/doctor', { params }),

  // Receptionist
  getReceptionistDashboard: (params) => axiosClient.get('/dashboard/receptionist', { params }),

  // Patient
  getPatientDashboard: (params) => axiosClient.get('/dashboard/patient', { params }),
};

export default dashboardApi;
