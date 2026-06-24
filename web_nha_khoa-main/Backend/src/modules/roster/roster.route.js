const router = require('express').Router();
const rosterController = require('./roster.controller');
const { createValidation, checkIdValidation } = require('./roster.validation');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { isAdmin, isStaff, isDoctor, isAdminOrReceptionist } = require('../../middlewares/role.middleware');

router.use(authenticate);

router.get('/available-doctors', isAdminOrReceptionist, rosterController.getAvailableDoctors);
router.get('/', isStaff, rosterController.getAll);
router.get('/:id', isStaff, rosterController.getById);

router.post('/', isDoctor, createValidation, validate, rosterController.create);
router.patch('/:id/approve', isAdmin, checkIdValidation, validate, rosterController.approve);
router.patch('/:id/reject', isAdmin, checkIdValidation, validate, rosterController.reject);
router.delete('/:id', isAdmin, checkIdValidation, validate, rosterController.remove);

module.exports = router;