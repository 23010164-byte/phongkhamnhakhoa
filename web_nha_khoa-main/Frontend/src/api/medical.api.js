import axiosClient from './axiosClient';

const medicalApi = {
  // ── Records ──────────────────────────────────────────────
  getRecords: (params) => axiosClient.get('/medical-records', { params }),

  getRecordById: (id) => axiosClient.get(`/medical-records/${id}`),

  createRecord: (data) => axiosClient.post('/medical-records', data),

  updateRecord: (id, data) => axiosClient.put(`/medical-records/${id}`, data),

  deleteRecord: (id) => axiosClient.delete(`/medical-records/${id}`),

  // ── Prescriptions ─────────────────────────────────────────
  getPrescriptionByRecord: (recordId) =>
    axiosClient.get(`/medical-records/${recordId}/prescription`),

  createPrescription: (recordId, data) =>
    axiosClient.post(`/medical-records/${recordId}/prescription`, data),

  updatePrescription: (recordId, data) =>
    axiosClient.put(`/medical-records/${recordId}/prescription`, data),

  // Dịch vụ
  getServices: (recordId) => 
    axiosClient.get(`/medical-records/${recordId}/services`),
    
  saveServices: (recordId, data) => 
    axiosClient.put(`/medical-records/${recordId}/services`, data),

  // ── Lookup ────────────────────────────────────────────────
  getMedicines: (params) => axiosClient.get('/medicines', { params }),

  getDiagnosisCodes: (params) =>
    axiosClient.get('/diagnosis-codes', { params }),
};

export default medicalApi;
