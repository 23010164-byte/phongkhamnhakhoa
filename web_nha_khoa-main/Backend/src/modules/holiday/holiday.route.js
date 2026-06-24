const router = require('express').Router();
const holidayController = require('./holiday.controller');
const { createValidation, updateValidation } = require('./holiday.validation');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { isAdmin } = require('../../middlewares/role.middleware');

router.use(authenticate);

router.get('/', holidayController.getAll);
router.get('/:id', holidayController.getById);
router.post('/', isAdmin, createValidation, validate, holidayController.create);
router.put('/:id', isAdmin, updateValidation, validate, holidayController.update);
router.delete('/:id', isAdmin, holidayController.remove);

module.exports = router;