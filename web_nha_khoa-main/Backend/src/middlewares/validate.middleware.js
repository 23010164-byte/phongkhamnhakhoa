const { validationResult } = require('express-validator');
const { badRequestResponse } = require('../utils/response');

/**
 * Middleware chạy sau các validation rules của express-validator
 * Trả về lỗi 400 nếu có validation error
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return badRequestResponse(res, {
      message: 'Dữ liệu đầu vào không hợp lệ',
      errors: formattedErrors,
    });
  }
  next();
};

module.exports = { validate };
