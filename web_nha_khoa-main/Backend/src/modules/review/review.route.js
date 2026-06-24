const router = require('express').Router();
const reviewController = require('./review.controller');
const { createReviewValidation, updateReviewValidation, replyValidation } = require('./review.validation');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate, optionalAuth } = require('../../middlewares/auth.middleware');
const { isAdmin, isDoctor, isPatient } = require('../../middlewares/role.middleware');

// Public: xem review bác sĩ
router.get('/', optionalAuth, reviewController.getAll);
router.get('/doctor/:doctorProfileId/summary', reviewController.getDoctorRatingSummary);
router.get('/:id', optionalAuth, reviewController.getById);

router.use(authenticate);

// Patient: tạo, sửa, xóa review của mình
router.post('/', isPatient, createReviewValidation, validate, reviewController.create);
router.put('/:id', updateReviewValidation, validate, reviewController.update);
router.delete('/:id', reviewController.delete);

// Doctor: phản hồi review
router.post('/:id/reply', isDoctor, replyValidation, validate, reviewController.reply);

// Admin: ẩn/hiện review
router.patch('/:id/visibility', isAdmin, reviewController.toggleVisibility);

module.exports = router;
