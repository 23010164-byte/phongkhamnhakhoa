const router = require('express').Router();
const { body } = require('express-validator');
const contactController = require('./contact.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { isAdmin, isAdminOrReceptionist } = require('../../middlewares/role.middleware');
const { authLimiter } = require('../../middlewares/rateLimiter.middleware');

const submitValidation = [
  body('fullName').trim().notEmpty().withMessage('Họ tên không được để trống').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
  body('phone').optional().matches(/^[0-9+\s()-]{8,20}$/).withMessage('Số điện thoại không hợp lệ (từ 8 đến 20 số)'),
  body('subject').trim().notEmpty().withMessage('Chủ đề không được để trống').isLength({ max: 200 }),
  body('message').trim().notEmpty().withMessage('Nội dung không được để trống').isLength({ min: 10, max: 2000 }),
];

// Public — gửi liên hệ
router.post('/', authLimiter, submitValidation, validate, contactController.submit);

// Staff
router.use(authenticate);
router.get('/', isAdminOrReceptionist, contactController.getAll);
router.get('/:id', isAdminOrReceptionist, contactController.getById);
router.patch('/:id/status', isAdminOrReceptionist, contactController.updateStatus);
router.post('/:id/reply', isAdminOrReceptionist, contactController.reply);
router.delete('/:id', isAdmin, contactController.delete);

module.exports = router;
