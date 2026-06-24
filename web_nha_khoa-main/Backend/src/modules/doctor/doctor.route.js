const router = require('express').Router();
const doctorController = require('./doctor.controller');
const { doctorProfileValidation } = require('./doctor.validation');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate, optionalAuth } = require('../../middlewares/auth.middleware');
const { isAdmin, isAdminOrDoctor, isDoctor } = require('../../middlewares/role.middleware');

// Doctor: quản lý profile bản thân
router.get('/me/profile', authenticate, isDoctor, doctorController.getMyProfile);
router.put('/me/profile', authenticate, isDoctor, doctorProfileValidation, validate, doctorController.updateMyProfile);
router.get('/me/schedule', authenticate, isDoctor, doctorController.getMySchedule);
router.post('/me/schedule', authenticate, isDoctor, doctorController.upsertSchedule);
router.delete('/me/schedule/:slotId', authenticate, isDoctor, doctorController.deleteSlot);

// Public: xem danh sách bác sĩ & slots
router.get('/', optionalAuth, doctorController.getAllDoctors);
router.get('/:id', optionalAuth, doctorController.getDoctorById);
router.get('/:id/slots', doctorController.getAvailableSlots);
router.get('/:id/rosters', doctorController.getDoctorRosters);

// Admin: tạo & quản lý doctor profiles
router.post('/', authenticate, isAdmin, doctorProfileValidation, validate, doctorController.createDoctorProfile);
router.put('/:id', authenticate, isAdminOrDoctor, doctorProfileValidation, validate, doctorController.updateDoctorProfile);
router.patch('/:id/availability', authenticate, isAdminOrDoctor, doctorController.toggleAvailability);

module.exports = router;
