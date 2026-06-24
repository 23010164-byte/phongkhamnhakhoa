const logger = require('../utils/logger');

// Custom AppError class
class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error
  if (error.statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} — ${err.message}`, {
      stack: err.stack,
      body: req.body,
      user: req.user?.id,
    });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} — ${err.message}`);
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors,
    });
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return res.status(409).json({
      success: false,
      message: `${field} đã tồn tại trong hệ thống`,
    });
  }

  // Sequelize foreign key constraint
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu liên quan không tồn tại',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token đã hết hạn, vui lòng đăng nhập lại',
    });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File tải lên vượt quá dung lượng cho phép (tối đa 5MB)',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Trường file không hợp lệ',
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode >= 500
      ? 'Lỗi hệ thống, vui lòng thử lại sau'
      : error.message || 'Có lỗi xảy ra';

  const response = { success: false, message };
  if (error.errors) response.errors = error.errors;

  return res.status(statusCode).json(response);
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route [${req.method}] ${req.originalUrl} không tồn tại`,
  });
};

module.exports = { AppError, errorHandler, notFoundHandler };
