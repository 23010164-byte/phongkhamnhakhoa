import axios from 'axios';
import { HTTP_STATUS } from '../utils/constants';
import { ROUTES } from '../routes/constants';
import {
  getACCESS_TOKEN,
  getRefreshToken,
  setACCESS_TOKEN,
  removeTokens,
} from '../utils/helpers';

// ─── API Base URL ───────────────────────────────────────────────────────────────
// Dùng relative path '/api/v1' → Vite proxy sẽ forward sang backend
const API_BASE_URL = '/api/v1';

// ─── Axios Instance ────────────────────────────────────────────────────────────

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15s
});

// ─── Refresh Token Logic ───────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue = []; // requests xếp hàng chờ token mới

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

const redirectToLogin = () => {
  removeTokens();
  // Dùng window.location để thoát khỏi React Router context
  window.location.href = ROUTES.LOGIN;
};

// ─── Request Interceptor ───────────────────────────────────────────────────────

axiosClient.interceptors.request.use(
  (config) => {
    const token = getACCESS_TOKEN();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ──────────────────────────────────────────────────────

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu không phải 401 hoặc đã retry rồi → throw thẳng
    if (
      error.response?.status !== HTTP_STATUS.UNAUTHORIZED ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // Nếu chính request refresh token bị 401 → đăng xuất
    if (originalRequest.url === '/auth/refresh-token') {
      redirectToLogin();
      return Promise.reject(error);
    }

    // Đang refresh → xếp hàng chờ
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Bắt đầu refresh
    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      isRefreshing = false;
      redirectToLogin();
      return Promise.reject(error);
    }

    try {
      const { data } = await axiosClient.post('/auth/refresh-token', {
        refreshToken,
      });

      // Backend trả { success: true, data: { ACCESS_TOKEN, expiresIn } }
      const newACCESS_TOKEN = data.data.ACCESS_TOKEN;
      setACCESS_TOKEN(newACCESS_TOKEN);

      // Cập nhật header cho request gốc và drain queue
      originalRequest.headers.Authorization = `Bearer ${newACCESS_TOKEN}`;
      axiosClient.defaults.headers.common.Authorization = `Bearer ${newACCESS_TOKEN}`;

      processQueue(null, newACCESS_TOKEN);
      return axiosClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosClient;
