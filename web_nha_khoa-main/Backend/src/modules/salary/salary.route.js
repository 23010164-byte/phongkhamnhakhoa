const router = require('express').Router();
const { authenticate } = require('../../middlewares/auth.middleware');
const { isAdmin, isAdminOrDoctor } = require('../../middlewares/role.middleware');
const salaryController = require('./salary.controller');

router.use(authenticate);

// ========================
// CẤU HÌNH LƯƠNG
// ========================
router.get('/config', isAdmin, salaryController.getConfig);
router.put('/config', isAdmin, salaryController.updateConfig);

// ========================
// TÍNH LƯƠNG THỬ (demo, không lưu DB)
// ========================
router.post('/calculate-shift', salaryController.calculateShift);

// ========================
// QUẢN LÝ ĐỘ PHỨC TẠP LỊCH HẸN
// ========================
router.get('/appointments', isAdmin, salaryController.getAppointments);
router.put('/appointments/:id/complexity', isAdmin, salaryController.updateComplexity);

// ========================
// PHIẾU LƯƠNG
// ========================
router.post('/slips/generate', isAdmin, salaryController.generateSlip);

// ========================
// BÁO CÁO
// ========================
router.get('/reports/month', isAdminOrDoctor, salaryController.getMonthlyReport);
router.get('/reports/year/doctor', isAdminOrDoctor, salaryController.getDoctorYearlyReport);
router.get('/reports/year/all', isAdmin, salaryController.getAllDoctorsYearlyReport);

module.exports = router;
