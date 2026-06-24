const { body } = require('express-validator');

const createReviewValidation = [
  body('appointmentId').isUUID().withMessage('appointmentId không hợp lệ'),
  body('rating')
    .notEmpty().withMessage('Vui lòng chọn số sao')
    .isInt({ min: 1, max: 5 }).withMessage('Đánh giá từ 1-5 sao'),
  body('comment').optional().trim().isLength({ max: 2000 }).withMessage('Nhận xét tối đa 2000 ký tự'),
  body('isAnonymous').optional().isBoolean(),
];

const updateReviewValidation = [
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Đánh giá từ 1-5 sao'),
  body('comment').optional().trim().isLength({ max: 2000 }),
];

const replyValidation = [
  body('reply').trim().notEmpty().withMessage('Nội dung phản hồi không được để trống')
    .isLength({ max: 2000 }).withMessage('Phản hồi tối đa 2000 ký tự'),
];

module.exports = { createReviewValidation, updateReviewValidation, replyValidation };
