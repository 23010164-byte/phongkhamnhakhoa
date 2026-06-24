const { body } = require('express-validator');

const bookValidation = [
  body('doctorProfileId').isUUID().withMessage('doctorProfileId không hợp lệ'),
  body('appointmentDate')
    .notEmpty().withMessage('Ngày khám không được để trống')
    .isDate().withMessage('Ngày khám không hợp lệ (YYYY-MM-DD)'),
  body('appointmentTime')
    .notEmpty().withMessage('Giờ khám không được để trống')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Giờ khám không hợp lệ (HH:mm)'),
  body('serviceId').optional().isUUID().withMessage('serviceId không hợp lệ'),
  body('reason').optional().trim().isLength({ max: 1000 }).withMessage('Lý do tối đa 1000 ký tự'),
  body('patientId').optional().isUUID().withMessage('patientId không hợp lệ'),
];

module.exports = { bookValidation };
