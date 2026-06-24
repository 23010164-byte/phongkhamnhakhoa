const router = require('express').Router();
const chatController = require('./chat.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const { isStaff } = require('../../middlewares/role.middleware');

router.use(authenticate);

// Rooms
router.get('/', chatController.getMyRooms);
router.get('/unread', chatController.getTotalUnread);
router.post('/private', chatController.openPrivateRoom);
router.post('/group', isStaff, chatController.createGroupRoom);
router.get('/appointment/:appointmentId', chatController.openAppointmentRoom);
router.get('/:roomId', chatController.getRoomById);
router.patch('/:roomId/read', chatController.markAsRead);

// Messages
router.get('/:roomId/messages', chatController.getMessages);
router.post('/:roomId/messages', chatController.sendMessage);
router.delete('/messages/:messageId', chatController.deleteMessage);

module.exports = router;
