const { ROLES } = require('../utils/constants');

/**
 * Định nghĩa quyền của từng role trong hệ thống phòng khám
 * Format: resource:action
 */
const PERMISSIONS = {
  // ========================
  // USER MANAGEMENT
  // ========================
  'users:read_all': [ROLES.ADMIN],
  'users:create': [ROLES.ADMIN],
  'users:update_any': [ROLES.ADMIN],
  'users:delete': [ROLES.ADMIN],
  'users:read_own': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT],
  'users:update_own': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT],

  // ========================
  // DOCTOR
  // ========================
  'doctors:read_all': [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.PATIENT, ROLES.DOCTOR],
  'doctors:create': [ROLES.ADMIN],
  'doctors:update_any': [ROLES.ADMIN],
  'doctors:update_own': [ROLES.DOCTOR],
  'doctors:delete': [ROLES.ADMIN],
  'doctors:toggle_availability': [ROLES.ADMIN, ROLES.DOCTOR],

  // ========================
  // SERVICE & SPECIALTY
  // ========================
  'services:read': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT],
  'services:create': [ROLES.ADMIN],
  'services:update': [ROLES.ADMIN],
  'services:delete': [ROLES.ADMIN],

  // ========================
  // APPOINTMENT
  // ========================
  'appointments:read_all': [ROLES.ADMIN, ROLES.RECEPTIONIST],
  'appointments:read_doctor': [ROLES.DOCTOR],
  'appointments:read_own': [ROLES.PATIENT],
  'appointments:create': [ROLES.PATIENT, ROLES.RECEPTIONIST, ROLES.ADMIN],
  'appointments:confirm': [ROLES.ADMIN, ROLES.RECEPTIONIST],
  'appointments:cancel_any': [ROLES.ADMIN, ROLES.RECEPTIONIST],
  'appointments:cancel_own': [ROLES.PATIENT],
  'appointments:update_status': [ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR],
  'appointments:checkin': [ROLES.RECEPTIONIST, ROLES.ADMIN],

  // ========================
  // MEDICAL RECORD
  // ========================
  'medical_records:read_all': [ROLES.ADMIN],
  'medical_records:read_doctor': [ROLES.DOCTOR],
  'medical_records:read_own': [ROLES.PATIENT],
  'medical_records:create': [ROLES.DOCTOR],
  'medical_records:update': [ROLES.DOCTOR],

  // ========================
  // PAYMENT
  // ========================
  'payments:read_all': [ROLES.ADMIN, ROLES.RECEPTIONIST],
  'payments:read_own': [ROLES.PATIENT],
  'payments:create': [ROLES.PATIENT, ROLES.RECEPTIONIST, ROLES.ADMIN],
  'payments:refund': [ROLES.ADMIN],

  // ========================
  // REVIEW
  // ========================
  'reviews:read': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT],
  'reviews:create': [ROLES.PATIENT],
  'reviews:update_own': [ROLES.PATIENT],
  'reviews:delete_any': [ROLES.ADMIN],
  'reviews:delete_own': [ROLES.PATIENT],
  'reviews:respond': [ROLES.DOCTOR],

  // ========================
  // NOTIFICATION
  // ========================
  'notifications:read_own': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT],
  'notifications:send': [ROLES.ADMIN],
  'notifications:delete_own': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT],

  // ========================
  // BLOG / CMS
  // ========================
  'blogs:read': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT],
  'blogs:create': [ROLES.ADMIN, ROLES.DOCTOR],
  'blogs:update_own': [ROLES.ADMIN, ROLES.DOCTOR],
  'blogs:update_any': [ROLES.ADMIN],
  'blogs:delete': [ROLES.ADMIN],
  'blogs:publish': [ROLES.ADMIN],

  // ========================
  // DASHBOARD
  // ========================
  'dashboard:admin': [ROLES.ADMIN],
  'dashboard:doctor': [ROLES.DOCTOR],
  'dashboard:receptionist': [ROLES.RECEPTIONIST],
  'dashboard:patient': [ROLES.PATIENT],

  // ========================
  // MEDIA
  // ========================
  'media:upload': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT],
  'media:delete_own': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT],
  'media:delete_any': [ROLES.ADMIN],

  // ========================
  // CHAT
  // ========================
  'chat:access': [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT],

  // ========================
  // CONTACT
  // ========================
  'contacts:read': [ROLES.ADMIN, ROLES.RECEPTIONIST],
  'contacts:create': [], // Public - không cần auth
  'contacts:update': [ROLES.ADMIN, ROLES.RECEPTIONIST],
  'contacts:delete': [ROLES.ADMIN],
};

/**
 * Kiểm tra user có permission không
 */
const hasPermission = (userRole, permission) => {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole);
};

/**
 * Middleware kiểm tra permission
 */
const checkPermission = (permission) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Chưa xác thực' });
  }
  if (!hasPermission(req.user.role, permission)) {
    return res.status(403).json({
      success: false,
      message: `Bạn không có quyền: ${permission}`,
    });
  }
  next();
};

module.exports = { PERMISSIONS, hasPermission, checkPermission };
