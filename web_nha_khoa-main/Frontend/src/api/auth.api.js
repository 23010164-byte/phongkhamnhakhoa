import axiosClient from './axiosClient';

/**
 * AUTH API
 * Tất cả request không cần auth header (trừ logout).
 * axiosClient tự attach token qua interceptor.
 */

const authApi = {
  /**
   * POST /auth/login
   * @param {{ email: string, password: string }} credentials
   * @returns {{ ACCESS_TOKEN, refreshToken, user }}
   */
  login: (credentials) => axiosClient.post('/auth/login', credentials),

  /**
   * POST /auth/register
   * @param {{ fullName: string, email: string, phone: string, password: string, gender: string, dateOfBirth: string }} data
   * @returns {{ message: string }}
   */
  register: (data) => axiosClient.post('/auth/register', data),

  /**
   * POST /auth/logout
   * Gửi refreshToken để server blacklist nó
   * @param {{ refreshToken: string }} data
   */
  logout: (data) => axiosClient.post('/auth/logout', data),

  /**
   * POST /auth/forgot-password
   * @param {{ email: string }} data
   * @returns {{ message: string }}
   */
  forgotPassword: (data) => axiosClient.post('/auth/forgot-password', data),

  /**
   * POST /auth/reset-password
   * @param {{ token: string, newPassword: string }} data
   * @returns {{ message: string }}
   */
  resetPassword: (data) => axiosClient.post('/auth/reset-password', data),

  /**
   * POST /auth/verify-email
   * @param {{ email: string, otp: string }} data
   * @returns {{ message: string }}
   */
  verifyEmail: (data) => axiosClient.post('/auth/verify-email', data),

  /**
   * POST /auth/resend-verify
   * @param {{ email: string }} data
   * @returns {{ message: string }}
   */
  resendVerification: (data) => axiosClient.post('/auth/resend-verify', data),

  /**
   * POST /auth/refresh-token
   * @param {{ refreshToken: string }} data
   * @returns {{ ACCESS_TOKEN, expiresIn }}
   */
  refreshToken: (data) => axiosClient.post('/auth/refresh-token', data),

  /**
   * GET /auth/me — lấy thông tin user đang đăng nhập
   * @returns {{ user }}
   */
  getMe: () => axiosClient.get('/auth/me'),
};

export default authApi;
