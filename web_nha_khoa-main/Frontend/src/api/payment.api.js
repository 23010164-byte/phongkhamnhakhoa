import axiosClient from './axiosClient';

const paymentApi = {
  // ── Payment list ──────────────────────────────────────────
  getPayments: (params) => axiosClient.get('/payments', { params }),

  getPaymentById: (id) => axiosClient.get(`/payments/${id}`),

  getPaymentByAppointment: (appointmentId) =>
    axiosClient.get(`/payments/appointment/${appointmentId}`),

  // ── Checkout ──────────────────────────────────────────────
  /**
   * Create a payment invoice for an appointment/record
   * @param {Object} data - { appointmentId, method: 'cash' | 'vnpay', returnUrl? }
   */
  createPayment: (data) => axiosClient.post('/payments', data),
  createCashPayment: (data) => axiosClient.post('/payments/cash', data),
  createVnpayPayment: (data) => axiosClient.post('/payments/vnpay', data),
  createMockOnlinePayment: (data) => axiosClient.post('/payments/mock-online', data),

  /**
   * Process cash payment (doctor/receptionist confirms)
   */
  confirmPayment: (id) => axiosClient.patch(`/payments/${id}/confirm`),

  /**
   * Initiate VNPay — returns { payUrl }
   */
  initiateVnpay: (id) => axiosClient.post(`/payments/${id}/vnpay`),

  /**
   * Verify VNPay return URL params (called after redirect)
   * @param {Object} params - raw query params from VNPay return URL
   */
  verifyVnpay: (params) => axiosClient.get('/payments/vnpay/return', { params }),

  // ── Refund ────────────────────────────────────────────────
  refundPayment: (id, reason) =>
    axiosClient.post(`/payments/${id}/refund`, { reason }),
};

export default paymentApi;
