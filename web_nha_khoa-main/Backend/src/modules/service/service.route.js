const router = require('express').Router();
const serviceController = require('./service.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { isAdmin } = require('../../middlewares/role.middleware');

// Public
router.get('/', serviceController.getAll);
router.get('/slug/:slug', serviceController.getBySlug);
router.get('/:id', serviceController.getById);

// Admin only
router.use(authenticate);
router.post('/', isAdmin, serviceController.create);
router.put('/:id', isAdmin, serviceController.update);
router.patch('/:id/toggle-status', isAdmin, serviceController.toggleStatus);
router.delete('/:id', isAdmin, serviceController.delete);

module.exports = router;
