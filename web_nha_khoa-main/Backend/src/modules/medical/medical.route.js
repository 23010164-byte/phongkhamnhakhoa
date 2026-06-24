const router = require('express').Router();
const medicalController = require('./medical.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { isAdmin, isAdminOrDoctor } = require('../../middlewares/role.middleware');

router.use(authenticate);

router.get('/', medicalController.getAll);
router.get('/appointment/:appointmentId', medicalController.getByAppointment);

// Đơn thuốc
router.get('/:recordId/prescription', medicalController.getPrescription);
router.post('/:recordId/prescription', isAdminOrDoctor, medicalController.createPrescription);
router.put('/:recordId/prescription', isAdminOrDoctor, medicalController.updatePrescription);

// Dịch vụ
router.get('/:id/services', medicalController.getServices);
router.put('/:id/services', isAdminOrDoctor, medicalController.saveServices);

router.get('/:id', medicalController.getById);
router.post('/', isAdminOrDoctor, medicalController.create);
router.put('/:id', isAdminOrDoctor, medicalController.update);

module.exports = router;
