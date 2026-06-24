const router = require('express').Router();
const appointmentController = require('./appointment.controller');
const { bookValidation } = require('./appointment.validation');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { isAdmin, isAdminOrReceptionist, isStaff, isAdminOrDoctor } = require('../../middlewares/role.middleware');

router.use(authenticate);

// Xem danh sách (theo role trong service)
router.get('/', appointmentController.getAll);
router.get('/code/:code', appointmentController.getByBookingCode);
router.get('/:id', appointmentController.getById);

// Đặt lịch: patient, receptionist, admin
router.post('/', bookValidation, validate, appointmentController.book);

// Quản lý trạng thái
router.patch('/:id/confirm', isAdminOrReceptionist, appointmentController.confirm);
router.patch('/:id/check-in', isAdminOrReceptionist, appointmentController.checkIn);
router.patch('/:id/complete', isAdminOrDoctor, appointmentController.complete);
router.patch('/:id/cancel', appointmentController.cancel); // ai cũng cancel được (service kiểm tra quyền)
router.patch('/:id/no-show', isAdminOrReceptionist, appointmentController.markNoShow);

module.exports = router;
