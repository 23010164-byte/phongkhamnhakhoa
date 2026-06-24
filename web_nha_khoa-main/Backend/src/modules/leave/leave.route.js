const router = require('express').Router();
const leaveController = require('./leave.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { isAdmin, isDoctor } = require('../../middlewares/role.middleware');

router.use(authenticate);

// Doctor routes
router.post('/', isDoctor, leaveController.create);

// Shared route (Admin sees all, Doctor sees theirs)
router.get('/', leaveController.getAll);

// Admin routes
router.put('/:id/status', isAdmin, leaveController.updateStatus);

module.exports = router;
