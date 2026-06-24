const router = require('express').Router();
const specialtyController = require('./specialty.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { isAdmin } = require('../../middlewares/role.middleware');

// Public
router.get('/', specialtyController.getAll);
router.get('/:id', specialtyController.getById);

// Admin only
router.use(authenticate);
router.post('/', isAdmin, specialtyController.create);
router.put('/:id', isAdmin, specialtyController.update);
router.delete('/:id', isAdmin, specialtyController.delete);

module.exports = router;
