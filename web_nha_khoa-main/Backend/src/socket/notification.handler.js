const logger = require('../utils/logger');

const notificationHandler = (io, socket) => {
  const userId = socket.user.id;

  // User join room cá nhân để nhận notification
  socket.join(`user:${userId}`);
  logger.debug(`[Socket] User ${userId} joined personal room`);

  // Client xác nhận đã nhận notification
  socket.on('notification:ack', ({ notificationId }) => {
    logger.debug(`[Socket] Notification ${notificationId} acked by user ${userId}`);
  });
};

module.exports = notificationHandler;
