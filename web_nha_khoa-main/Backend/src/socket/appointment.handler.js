const logger = require('../utils/logger');

module.exports = (io, socket) => {
  socket.on('appointment:subscribe_monitor', (date) => {
    if (!date) return;
    const room = `appointment-monitor-${date}`;
    socket.join(room);
    logger.info(`[Socket] User ${socket.user.id} joined room ${room}`);
  });

  socket.on('appointment:unsubscribe_monitor', (date) => {
    if (!date) return;
    const room = `appointment-monitor-${date}`;
    socket.leave(room);
    logger.info(`[Socket] User ${socket.user.id} left room ${room}`);
  });
};
