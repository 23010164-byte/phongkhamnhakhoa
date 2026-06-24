const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { cache } = require('../config/redis');
const { AppError } = require('./error.middleware');
const { unauthorizedResponse } = require('../utils/response');

/**
 * Xác thực access token từ Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse(res, 'Vui lòng đăng nhập để tiếp tục');
    }

    const token = authHeader.split(' ')[1];

    // Kiểm tra token có bị blacklist không (sau khi logout)
    const isBlacklisted = await cache.isBlacklisted(token);
    if (isBlacklisted) {
      return unauthorizedResponse(res, 'Token không còn hiệu lực, vui lòng đăng nhập lại');
    }

    // Verify token
    const decoded = jwt.verify(token, jwtConfig.access.secret);

    // Gắn user info vào request
    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return unauthorizedResponse(res, 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
    }
    if (error.name === 'JsonWebTokenError') {
      return unauthorizedResponse(res, 'Token không hợp lệ');
    }
    next(error);
  }
};

/**
 * Optional auth - không bắt buộc đăng nhập
 * Dùng cho route public nhưng cần biết user nếu có
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const isBlacklisted = await cache.isBlacklisted(token);
    if (!isBlacklisted) {
      const decoded = jwt.verify(token, jwtConfig.access.secret);
      req.user = decoded;
      req.token = token;
    }
  } catch {
    // Bỏ qua lỗi, tiếp tục với req.user = undefined
  }
  next();
};

module.exports = { authenticate, optionalAuth };
