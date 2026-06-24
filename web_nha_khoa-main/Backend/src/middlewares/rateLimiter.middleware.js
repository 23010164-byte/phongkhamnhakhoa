const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 phút
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, {
      message: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
      statusCode: 429,
    });
  },
});

// Strict limiter cho auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, {
      message: 'Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút',
      statusCode: 429,
    });
  },
});

// Upload limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 20,
  handler: (req, res) => {
    return errorResponse(res, {
      message: 'Quá nhiều yêu cầu tải lên, vui lòng thử lại sau',
      statusCode: 429,
    });
  },
});

module.exports = { apiLimiter, authLimiter, uploadLimiter };
