const { body, param } = require('express-validator');

const createValidation = [
  body('holiday_date').notEmpty().withMessage('Ngày nghỉ không được để trống').isDate().withMessage('Ngày nghỉ không hợp lệ (YYYY-MM-DD)'),
  body('holiday_type').notEmpty().withMessage('Loại nghỉ không được để trống').isIn(['national', 'clinic', 'emergency']).withMessage('Loại nghỉ không hợp lệ'),
  body('note').optional().trim().isLength({ max: 500 }).withMessage('Ghi chú tối đa 500 ký tự'),
];

const updateValidation = [
  param('id').isUUID().withMessage('ID không hợp lệ'),
  body('holiday_date').optional().isDate().withMessage('Ngày nghỉ không hợp lệ'),
  body('holiday_type').optional().isIn(['national', 'clinic', 'emergency']).withMessage('Loại nghỉ không hợp lệ'),
  body('note').optional().trim().isLength({ max: 500 }).withMessage('Ghi chú tối đa 500 ký tự'),
  body('is_active').optional().isBoolean().withMessage('Trạng thái không hợp lệ'),
];

module.exports = { createValidation, updateValidation };