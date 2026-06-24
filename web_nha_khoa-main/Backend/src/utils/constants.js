// ========================
// ROLES
// ========================
const ROLES = Object.freeze({
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  RECEPTIONIST: 'receptionist',
  PATIENT: 'patient',
});

// ========================
// APPOINTMENT STATUS
// ========================
const APPOINTMENT_STATUS = Object.freeze({
  PENDING: 'pending',           // Chờ xác nhận
  CONFIRMED: 'confirmed',       // Đã xác nhận
  CHECKED_IN: 'checked_in',     // Đã đến phòng khám
  IN_PROGRESS: 'in_progress',   // Đang khám
  COMPLETED: 'completed',       // Hoàn thành
  CANCELLED: 'cancelled',       // Đã hủy
  NO_SHOW: 'no_show',           // Không đến
});

// ========================
// PAYMENT STATUS
// ========================
const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PENDING_CONFIRMATION: 'pending_confirmation',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
});

// ========================
// PAYMENT METHOD
// ========================
const PAYMENT_METHOD = Object.freeze({
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  VNPAY: 'vnpay',
  MOMO: 'momo',
});

// ========================
// GENDER
// ========================
const GENDER = Object.freeze({
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
});

// ========================
// NOTIFICATION TYPE
// ========================
const NOTIFICATION_TYPE = Object.freeze({
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  APPOINTMENT_COMPLETED: 'appointment_completed',
  PAYMENT_SUCCESS: 'payment_success',
  SYSTEM: 'system',
  CHAT: 'chat',
});

// ========================
// NOTIFICATION CHANNEL
// ========================
const NOTIFICATION_CHANNEL = Object.freeze({
  IN_APP: 'in_app',
  EMAIL: 'email',
  SMS: 'sms',
});

// ========================
// DOCTOR SCHEDULE
// ========================
const DAYS_OF_WEEK = Object.freeze({
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',
});

// ========================
// MEDICAL RECORD
// ========================
const MEDICAL_RECORD_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

// ========================
// BLOG / CMS
// ========================
const BLOG_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
});

// ========================
// FILE / MEDIA
// ========================
const MEDIA_TYPE = Object.freeze({
  AVATAR: 'avatar',
  DOCUMENT: 'document',
  RESULT: 'result',
  BLOG: 'blog',
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', ...ALLOWED_IMAGE_TYPES];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ========================
// PAGINATION
// ========================
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// ========================
// CACHE TTL (seconds)
// ========================
const CACHE_TTL = Object.freeze({
  SHORT: 60,          // 1 phút
  MEDIUM: 300,        // 5 phút
  LONG: 3600,         // 1 giờ
  DAY: 86400,         // 1 ngày
  WEEK: 604800,       // 1 tuần
});

// ========================
// QUEUE NAMES
// ========================
const QUEUE_NAMES = Object.freeze({
  NOTIFICATION: 'notification-queue',
  APPOINTMENT_REMINDER: 'appointment-reminder-queue',
  EMAIL: 'email-queue',
});

// ========================
// HOLIDAY TYPE
// ========================
const HOLIDAY_TYPE = Object.freeze({
  NATIONAL: 'national',
  CLINIC: 'clinic',
  EMERGENCY: 'emergency',
});

// ========================
// ROSTER STATUS
// ========================
const ROSTER_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

// ========================
// LEAVE STATUS
// ========================
const LEAVE_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

module.exports = {
  ROLES,
  APPOINTMENT_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  GENDER,
  NOTIFICATION_TYPE,
  NOTIFICATION_CHANNEL,
  DAYS_OF_WEEK,
  MEDICAL_RECORD_STATUS,
  BLOG_STATUS,
  MEDIA_TYPE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_FILE_SIZE,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  CACHE_TTL,
  QUEUE_NAMES,
  HOLIDAY_TYPE,
  ROSTER_STATUS,
  LEAVE_STATUS,
};
