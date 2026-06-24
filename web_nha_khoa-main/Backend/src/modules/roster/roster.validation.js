const { body, param, query } = require('express-validator');

const createValidation = [
  body('shift_id').isUUID().withMessage('Ca làm việc không hợp lệ'),
  body('roster_date').isDate().withMessage('Ngày trực không hợp lệ (YYYY-MM-DD)'),
  body('doctor_profile_id').optional().isUUID().withMessage('Bác sĩ không hợp lệ'),
  body('note').optional().trim().isLength({ max: 500 }).withMessage('Ghi chú tối đa 500 ký tự'),
];

const checkIdValidation = [
  param('id').isUUID().withMessage('ID không hợp lệ'),
];

module.exports = { createValidation, checkIdValidation };