const router = require('express').Router();
const dashboardController = require('./dashboard.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { isAdmin, isDoctor, isReceptionist, isPatient } = require('../../middlewares/role.middleware');

router.use(authenticate);

// Route tổng — tự phân theo role
router.get('/', dashboardController.getDashboard);

// Routes riêng từng role
router.get('/admin', isAdmin, dashboardController.getAdminDashboard);
router.get('/doctor', isDoctor, dashboardController.getDoctorDashboard);
router.get('/receptionist', isReceptionist, dashboardController.getReceptionistDashboard);
router.get('/patient', isPatient, dashboardController.getPatientDashboard);

module.exports = router;
