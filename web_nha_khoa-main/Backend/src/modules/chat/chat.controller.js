const chatService = require('./chat.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../utils/response');

const chatController = {
  async getMyRooms(req, res, next) {
    try {
      const { rooms, total } = await chatService.getMyRooms(req.user.id, req.query);
      const { page = 1, limit = 20 } = req.query;
      return paginatedResponse(res, { data: rooms, total, page, limit });
    } catch (error) { next(error); }
  },

  async openPrivateRoom(req, res, next) {
    try {
      const { targetUserId } = req.body;
      const { room, created } = await chatService.openPrivateRoom(req.user.id, targetUserId);
      const fn = created ? createdResponse : successResponse;
      return fn(res, { message: created ? 'Tạo phòng chat thành công' : 'Mở phòng chat thành công', data: room });
    } catch (error) { next(error); }
  },

  async createGroupRoom(req, res, next) {
    try {
      const { name, memberIds, appointmentId } = req.body;
      const room = await chatService.createGroupRoom({ name, memberIds, createdBy: req.user.id, appointmentId });
      return createdResponse(res, { message: 'Tạo nhóm chat thành công', data: room });
    } catch (error) { next(error); }
  },

  async openAppointmentRoom(req, res, next) {
    try {
      const room = await chatService.openAppointmentRoom(req.params.appointmentId, req.user.id);
      return successResponse(res, { data: room });
    } catch (error) { next(error); }
  },

  async getRoomById(req, res, next) {
    try {
      const room = await chatService.getRoomById(req.params.roomId, req.user.id);
      return successResponse(res, { data: room });
    } catch (error) { next(error); }
  },

  async getMessages(req, res, next) {
    try {
      const { messages, total } = await chatService.getMessages(req.params.roomId, req.user.id, req.query);
      return successResponse(res, { data: messages, meta: { total } });
    } catch (error) { next(error); }
  },

  async sendMessage(req, res, next) {
    try {
      const { content, type, mediaUrl, replyToId } = req.body;
      const message = await chatService.sendMessage({
        roomId: req.params.roomId,
        senderId: req.user.id,
        content,
        type,
        mediaUrl,
        replyToId,
      });
      return createdResponse(res, { data: message });
    } catch (error) { next(error); }
  },

  async deleteMessage(req, res, next) {
    try {
      await chatService.deleteMessage(req.params.messageId, req.user.id);
      return successResponse(res, { message: 'Đã thu hồi tin nhắn' });
    } catch (error) { next(error); }
  },

  async markAsRead(req, res, next) {
    try {
      await chatService.markRoomAsRead(req.params.roomId, req.user.id);
      return successResponse(res, { message: 'Đã đánh dấu đã đọc' });
    } catch (error) { next(error); }
  },

  async getTotalUnread(req, res, next) {
    try {
      const count = await chatService.getTotalUnread(req.user.id);
      return successResponse(res, { data: { unreadCount: count } });
    } catch (error) { next(error); }
  },
};

module.exports = chatController;
