const { Server } = require('socket.io');
const socketAuthMiddleware = require('./socket.auth');
const chatHandler = require('./chat.handler');
const notificationHandler = require('./notification.handler');
const appointmentHandler = require('./appointment.handler');
const logger = require('../utils/logger');

// Map lưu userId → Set<socketId> (1 user có thể nhiều tab)
const onlineUsers = new Map();

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: (process.env.CLIENT_URL || 'http://localhost:3000').split(',').map((o) => o.trim()),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });

  // Gắn io vào global để các service khác dùng được
  global.io = io;

  // ========================
  // AUTH MIDDLEWARE
  // ========================
  io.use(socketAuthMiddleware);

  // ========================
  // CONNECTION
  // ========================
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    logger.info(`[Socket] ✅ User ${userId} (${socket.user.role}) connected — socketId: ${socket.id}`);

    // Track online users
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast online status
    socket.broadcast.emit('user:online', { userId });

    // ========================
    // REGISTER HANDLERS
    // ========================
    notificationHandler(io, socket);
    chatHandler(io, socket);
    appointmentHandler(io, socket);

    // ========================
    // ONLINE USERS LIST
    // ========================
    socket.on('users:online', (callback) => {
      if (typeof callback === 'function') {
        callback([...onlineUsers.keys()]);
      }
    });

    socket.on('user:is_online', ({ userId: targetId }, callback) => {
      if (typeof callback === 'function') {
        callback(onlineUsers.has(targetId) && onlineUsers.get(targetId).size > 0);
      }
    });

    // ========================
    // DISCONNECT
    // ========================
    socket.on('disconnect', (reason) => {
      logger.info(`[Socket] ❌ User ${userId} disconnected — reason: ${reason}`);

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          // Tất cả tab đã đóng → offline
          socket.broadcast.emit('user:offline', { userId });
        }
      }
    });

    // ========================
    // ERROR
    // ========================
    socket.on('error', (err) => {
      logger.error(`[Socket] Error from user ${userId}:`, err.message);
    });
  });

  logger.info('✅ Socket.io khởi động thành công');
  return io;
};

const getOnlineUsers = () => [...onlineUsers.keys()];

const isUserOnline = (userId) =>
  onlineUsers.has(userId) && onlineUsers.get(userId).size > 0;

module.exports = { initSocket, getOnlineUsers, isUserOnline };
