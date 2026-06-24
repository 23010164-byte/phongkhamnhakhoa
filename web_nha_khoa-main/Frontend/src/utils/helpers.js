import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';

// ─── Token Helpers ─────────────────────────────────────────────────────────────

export const getACCESS_TOKEN = () => localStorage.getItem(ACCESS_TOKEN);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN);
export const setACCESS_TOKEN = (token) => localStorage.setItem(ACCESS_TOKEN, token);
export const setTokens = ({ ACCESS_TOKEN: at, refreshToken: rt }) => {
  localStorage.setItem(ACCESS_TOKEN, at);
  localStorage.setItem(REFRESH_TOKEN, rt);
};
export const removeTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
};

// ─── Error Helpers ─────────────────────────────────────────────────────────────

export const extractErrorMessage = (err, fallback = 'Có lỗi xảy ra.') => {
  const apiErrors = err?.response?.data?.errors;
  if (apiErrors && Array.isArray(apiErrors) && apiErrors.length > 0) {
    return apiErrors.map(e => e.message || e.msg).join(', ');
  }
  return err?.response?.data?.message || err?.message || fallback;
};

// ─── Currency ─────────────────────────────────────────────────────────────────

/**
 * Format VND currency
 */
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    amount ?? 0
  );


/**
 * Payment status label + color
 */
export const paymentStatusMeta = {
  pending: { label: 'Chờ thanh toán', color: '#f59e0b' },
  paid: { label: 'Đã thanh toán', color: '#10b981' },
  failed: { label: 'Thất bại', color: '#ef4444' },
  refunded: { label: 'Đã hoàn tiền', color: '#6b7280' },
};

export const getPaymentStatus = (status) =>
  paymentStatusMeta[status] || { label: status, color: '#6b7280' };

/**
 * Medical record status
 */
export const recordStatusMeta = {
  draft: { label: 'Nháp', color: '#6b7280' },
  active: { label: 'Đang điều trị', color: '#3b82f6' },
  completed: { label: 'Hoàn thành', color: '#10b981' },
  cancelled: { label: 'Đã huỷ', color: '#ef4444' },
};

export const getRecordStatus = (status) =>
  recordStatusMeta[status] || { label: status, color: '#6b7280' };

/**
 * Simple form validators
 */
export const validators = {
  required: (value) => (value !== undefined && value !== '' && value !== null ? null : 'Trường này là bắt buộc'),
  minLength: (min) => (value) =>
    value && value.length >= min ? null : `Tối thiểu ${min} ký tự`,
  maxLength: (max) => (value) =>
    !value || value.length <= max ? null : `Tối đa ${max} ký tự`,
  positiveNumber: (value) =>
    value > 0 ? null : 'Phải là số dương',
};

/**
 * Run validators on a field and return first error
 */
export const validate = (value, rules) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};

export const formatDate = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatDateTime = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
