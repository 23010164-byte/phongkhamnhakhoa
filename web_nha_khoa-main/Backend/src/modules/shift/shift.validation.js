const { body, param } = require('express-validator');

const createValidation = [
  body('name').notEmpty().withMessage('Tên ca không được để trống'),
  body('start_time').notEmpty().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Giờ bắt đầu không hợp lệ'),
  body('end_time').notEmpty().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Giờ kết thúc không hợp lệ'),
];

const updateValidation = [
  param('id').isUUID().withMessage('ID không hợp lệ'),
  body('name').optional().notEmpty().withMessage('Tên ca không được để trống'),
  body('start_time').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Giờ bắt đầu không hợp lệ'),
  body('end_time').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Giờ kết thúc không hợp lệ'),
  body('is_active').optional().isBoolean().withMessage('Trạng thái không hợp lệ'),
];

module.exports = { createValidation, updateValidation };