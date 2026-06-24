const router = require('express').Router();
const notificationController = require('./notification.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', notificationController.getMyNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/delete-all', notificationController.deleteAll);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.delete);

module.exports = router;
