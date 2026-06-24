const router = require('express').Router();
const paymentController = require('./payment.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { isAdmin, isAdminOrReceptionist } = require('../../middlewares/role.middleware');

// VNPay callback - không cần auth (VNPay gọi trực tiếp)
router.get('/vnpay-return', paymentController.vnpayReturn);
router.get('/vnpay/return', paymentController.verifyVnpay);


router.use(authenticate);

router.get('/', paymentController.getAll);
router.get('/appointment/:appointmentId', paymentController.getByAppointment);
router.get('/:id', paymentController.getById);

// Thanh toán tiền mặt: lễ tân / admin
router.post('/cash', isAdminOrReceptionist, paymentController.createCashPayment);

// Giả lập thanh toán online cho patient (MoMo, Bank Transfer)
router.post('/mock-online', paymentController.createMockOnlinePayment);

// Thanh toán VNPay: patient tự thanh toán
router.post('/vnpay', paymentController.createVnpayPayment);

// Xác nhận thanh toán: lễ tân / admin
router.patch('/:id/confirm', isAdminOrReceptionist, paymentController.confirmPayment);

// Hoàn tiền: admin only
router.patch('/:id/refund', isAdmin, paymentController.refund);

module.exports = router;
