const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { cache } = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Socket.IO auth middleware
 * Client gửi token qua: socket.auth = { token: '...' }
 * hoặc query: ?token=...
 */
const socketAuthMiddleware = async (socket, next) => {
  try {
    // Lấy token từ auth hoặc query
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
      socket.handshake.query?.token;

    if (!token) {
      logger.warn(`[Socket] Kết nối bị từ chối — không có token (${socket.handshake.address})`);
      return next(new Error('Vui lòng cung cấp token xác thực'));
    }

    // Kiểm tra blacklist
    const isBlacklisted = await cache.isBlacklisted(token);
    if (isBlacklisted) {
      return next(new Error('Token không còn hiệu lực'));
    }

    // Verify token
    const decoded = jwt.verify(token, jwtConfig.access.secret);

    // Gắn user info vào socket
    socket.user = decoded;
    socket.token = token;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('[Socket] Token hết hạn');
      return next(new Error('Token đã hết hạn, vui lòng đăng nhập lại'));
    }
    if (error.name === 'JsonWebTokenError') {
      logger.warn('[Socket] Token không hợp lệ');
      return next(new Error('Token không hợp lệ'));
    }
    logger.error('[Socket] Auth middleware error:', error.message);
    next(new Error('Xác thực thất bại'));
  }
};

module.exports = socketAuthMiddleware;
