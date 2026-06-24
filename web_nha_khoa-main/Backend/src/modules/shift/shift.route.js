const router = require('express').Router();
const shiftController = require('./shift.controller');
const { createValidation, updateValidation } = require('./shift.validation');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { isAdmin } = require('../../middlewares/role.middleware');

router.use(authenticate);

router.get('/', shiftController.getAll);
router.get('/:id', shiftController.getById);
router.post('/', isAdmin, createValidation, validate, shiftController.create);
router.put('/:id', isAdmin, updateValidation, validate, shiftController.update);
router.delete('/:id', isAdmin, shiftController.remove);

module.exports = router;