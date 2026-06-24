const { body, param, query } = require('express-validator');
const { DAYS_OF_WEEK } = require('../../utils/constants');

const doctorProfileValidation = [
  body('userId').optional().isUUID().withMessage('userId không hợp lệ'),
  body('specialtyId').optional().isUUID().withMessage('specialtyId không hợp lệ'),
  body('title').optional().trim().isLength({ max: 100 }),
  body('consultationFee').optional().isFloat({ min: 0 }).withMessage('Phí khám phải >= 0'),
  body('workingDays')
    .optional()
    .isArray().withMessage('workingDays phải là mảng')
    .custom((days) => {
      const valid = Object.values(DAYS_OF_WEEK);
      if (!days.every((d) => valid.includes(d))) throw new Error('Ngày làm việc không hợp lệ');
      return true;
    }),
  body('workingStart')
    .optional()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Giờ bắt đầu không hợp lệ (HH:mm)'),
  body('workingEnd')
    .optional()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Giờ kết thúc không hợp lệ (HH:mm)'),
  body('slotDurationMinutes')
    .optional()
    .isInt({ min: 15, max: 120 }).withMessage('Thời lượng slot từ 15-120 phút'),
  body('experienceYears').optional().isInt({ min: 0 }).withMessage('Số năm kinh nghiệm phải >= 0'),
];

module.exports = { doctorProfileValidation };
