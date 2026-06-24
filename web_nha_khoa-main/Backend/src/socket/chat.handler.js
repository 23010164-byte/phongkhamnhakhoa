const chatService = require('../modules/chat/chat.service');
const logger = require('../utils/logger');

const chatHandler = (io, socket) => {
  const userId = socket.user.id;
  const userRole = socket.user.role;

  // ========================
  // JOIN ROOM
  // ========================
  socket.on('chat:join', async ({ roomId }) => {
    try {
      // Kiểm tra user có quyền vào room không
      const room = await chatService.getRoomById(roomId, userId);
      if (!room) {
        return socket.emit('chat:error', { message: 'Không tìm thấy phòng chat hoặc bạn không có quyền truy cập' });
      }

      socket.join(`room:${roomId}`);
      socket.currentRoomId = roomId;

      // Đánh dấu đã đọc khi vào room
      await chatService.markRoomAsRead(roomId, userId);

      // Thông báo user online trong room
      socket.to(`room:${roomId}`).emit('chat:user_joined', {
        userId,
        roomId,
        timestamp: new Date(),
      });

      socket.emit('chat:joined', { roomId, message: 'Đã vào phòng chat' });
      logger.debug(`[Socket] User ${userId} joined room ${roomId}`);
    } catch (err) {
      logger.error('[Socket] chat:join error:', err.message);
      socket.emit('chat:error', { message: 'Không thể vào phòng chat' });
    }
  });

  // ========================
  // GỬI TIN NHẮN
  // ========================
  socket.on('chat:send_message', async ({ roomId, content, type = 'text', mediaUrl }) => {
    try {
      if (!content?.trim() && !mediaUrl) {
        return socket.emit('chat:error', { message: 'Tin nhắn không được để trống' });
      }

      const message = await chatService.sendMessage({
        roomId,
        senderId: userId,
        content: content?.trim(),
        type,
        mediaUrl,
      });

      // Broadcast tới tất cả members trong room (kể cả sender)
      io.to(`room:${roomId}`).emit('chat:new_message', message);

      // Push notification cho thành viên offline
      const room = await chatService.getRoomById(roomId, userId);
      if (room) {
        const otherMembers = room.members.filter((m) => m.user_id !== userId);
        for (const member of otherMembers) {
          const memberSocket = io.sockets.sockets.get(`user_socket:${member.user_id}`);
          if (!memberSocket) {
            // User offline → gửi notification
            const notificationService = require('../modules/notification/notification.service');
            await notificationService.send({
              userId: member.user_id,
              type: 'chat',
              title: `Tin nhắn mới từ ${socket.user.full_name || 'người dùng'}`,
              body: type === 'text' ? content?.slice(0, 100) : '📎 Đã gửi một file',
              data: { roomId },
            }).catch(() => {});
          }
        }
      }
    } catch (err) {
      logger.error('[Socket] chat:send_message error:', err.message);
      socket.emit('chat:error', { message: 'Không thể gửi tin nhắn' });
    }
  });

  // ========================
  // TYPING INDICATOR
  // ========================
  socket.on('chat:typing', ({ roomId, isTyping }) => {
    socket.to(`room:${roomId}`).emit('chat:typing', {
      userId,
      roomId,
      isTyping,
    });
  });

  // ========================
  // ĐÃ ĐỌC TIN NHẮN
  // ========================
  socket.on('chat:read', async ({ roomId }) => {
    try {
      await chatService.markRoomAsRead(roomId, userId);
      socket.to(`room:${roomId}`).emit('chat:read', { userId, roomId });
    } catch (err) {
      logger.error('[Socket] chat:read error:', err.message);
    }
  });

  // ========================
  // LEAVE ROOM
  // ========================
  socket.on('chat:leave', ({ roomId }) => {
    socket.leave(`room:${roomId}`);
    socket.to(`room:${roomId}`).emit('chat:user_left', { userId, roomId });
    logger.debug(`[Socket] User ${userId} left room ${roomId}`);
  });
};

module.exports = chatHandler;
