const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');
const slugify = require('slugify');
const { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } = require('./constants');

// ========================
// PAGINATION
// ========================
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || DEFAULT_PAGE);
  const limit = Math.min(parseInt(query.limit) || DEFAULT_LIMIT, MAX_LIMIT);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const getPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNext: page < Math.ceil(total / limit),
  hasPrev: page > 1,
});

// ========================
// UUID
// ========================
const generateId = () => uuidv4();

// ========================
// SLUG
// ========================
const generateSlug = (text) =>
  slugify(text, {
    lower: true,
    strict: true,
    locale: 'vi',
  });

// ========================
// DATE / TIME
// ========================
const formatDate = (date, fmt = 'DD/MM/YYYY') => dayjs(date).format(fmt);

const formatDateTime = (date) => dayjs(date).format('DD/MM/YYYY HH:mm');

const isBeforeNow = (date) => dayjs(date).isBefore(dayjs());

const isAfterNow = (date) => dayjs(date).isAfter(dayjs());

const addMinutes = (date, minutes) => dayjs(date).add(minutes, 'minute').toDate();

const addDays = (date, days) => dayjs(date).add(days, 'day').toDate();

// Parse "HH:mm" string thành giờ/phút
const parseTime = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
};

// Kiểm tra time slot có nằm trong giờ làm việc không
const isInWorkingHours = (timeStr, startStr, endStr) => {
  const toMinutes = (t) => {
    const { hours, minutes } = parseTime(t);
    return hours * 60 + minutes;
  };
  const t = toMinutes(timeStr);
  const s = toMinutes(startStr);
  const e = toMinutes(endStr);
  return t >= s && t < e;
};

// ========================
// STRING
// ========================
const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  const masked = local.slice(0, 2) + '*'.repeat(Math.max(local.length - 4, 2)) + local.slice(-2);
  return `${masked}@${domain}`;
};

const maskPhone = (phone) =>
  phone ? phone.slice(0, 3) + '****' + phone.slice(-3) : '';

// ========================
// RANDOM
// ========================
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

const generateBookingCode = () => {
  const prefix = 'BK';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// ========================
// OBJECT
// ========================
const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach((k) => delete result[k]);
  return result;
};

const pick = (obj, keys) =>
  keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key];
    return acc;
  }, {});

module.exports = {
  getPagination,
  getPaginationMeta,
  generateId,
  generateSlug,
  formatDate,
  formatDateTime,
  isBeforeNow,
  isAfterNow,
  addMinutes,
  addDays,
  parseTime,
  isInWorkingHours,
  capitalize,
  maskEmail,
  maskPhone,
  generateOTP,
  generateBookingCode,
  omit,
  pick,
};
