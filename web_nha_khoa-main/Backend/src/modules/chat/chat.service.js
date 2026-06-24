const chatRepository = require('./chat.repository');
const userRepository = require('../user/user.repository');
const { AppError } = require('../../middlewares/error.middleware');
const { getPagination } = require('../../utils/helpers');
const { ROLES } = require('../../utils/constants');

const chatService = {
  // --------------------
  // TẠO / MỞ PHÒNG CHAT PRIVATE
  // --------------------
  async openPrivateRoom(myId, targetUserId) {
    if (myId === targetUserId) {
      throw new AppError('Không thể mở phòng chat với chính mình', 400);
    }

    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) throw new AppError('Không tìm thấy người dùng', 404);

    const { room, created } = await chatRepository.findOrCreatePrivateRoom(myId, targetUserId);
    return { room, created };
  },

  // --------------------
  // TẠO GROUP CHAT (Admin/Doctor/Receptionist)
  // --------------------
  async createGroupRoom({ name, memberIds, createdBy, appointmentId }) {
    if (!name?.trim()) throw new AppError('Tên phòng chat không được để trống', 400);
    if (!memberIds?.length) throw new AppError('Nhóm phải có ít nhất 1 thành viên', 400);

    return chatRepository.createGroupRoom({ name: name.trim(), memberIds, createdBy, appointmentId });
  },

  // --------------------
  // TẠO ROOM TỪ APPOINTMENT (Doctor - Patient)
  // --------------------
  async openAppointmentRoom(appointmentId, requestUserId) {
    const appointmentRepository = require('../appointment/appointment.repository');
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) throw new AppError('Không tìm thấy lịch hẹn', 404);

    const doctorProfile = appointment.doctor;
    const patientId = appointment.patient_id;
    const doctorUserId = doctorProfile?.user?.id;

    // Kiểm tra quyền: chỉ bác sĩ hoặc bệnh nhân trong lịch hẹn
    if (requestUserId !== patientId && requestUserId !== doctorUserId) {
      throw new AppError('Bạn không có quyền mở phòng chat cho lịch hẹn này', 403);
    }

    // Tìm room đã có cho appointment này
    const { ChatRoom } = require('./chat.model');
    let room = await ChatRoom.findOne({ where: { appointment_id: appointmentId } });

    if (!room) {
      // Tạo mới
      const result = await chatRepository.createGroupRoom({
        name: `Tư vấn - Lịch hẹn ${appointment.booking_code}`,
        memberIds: [patientId, doctorUserId].filter(Boolean),
        createdBy: requestUserId,
        appointmentId,
      });
      room = result;
    } else {
      room = await chatRepository.findRoomById(room.id, requestUserId);
    }

    return room;
  },

  // --------------------
  // LẤY DANH SÁCH PHÒNG CHAT
  // --------------------
  async getMyRooms(userId, query) {
    const { page, limit, offset } = getPagination(query);
    return chatRepository.findRoomsByUser(userId, { offset, limit });
  },

  // --------------------
  // LẤY ROOM THEO ID
  // --------------------
  async getRoomById(roomId, userId) {
    const isMember = await chatRepository.isMember(roomId, userId);
    if (!isMember) throw new AppError('Bạn không có quyền truy cập phòng chat này', 403);

    const room = await chatRepository.findRoomById(roomId, userId);
    if (!room) throw new AppError('Không tìm thấy phòng chat', 404);

    return room;
  },

  // --------------------
  // LẤY TIN NHẮN
  // --------------------
  async getMessages(roomId, userId, query) {
    const isMember = await chatRepository.isMember(roomId, userId);
    if (!isMember) throw new AppError('Bạn không có quyền xem phòng chat này', 403);

    const { limit = 50 } = query;
    const { before } = query;
    const { total, messages } = await chatRepository.findMessages(roomId, {
      offset: 0,
      limit: parseInt(limit),
      before,
    });

    // Đánh dấu đã đọc khi lấy tin nhắn
    await chatRepository.markRoomAsRead(roomId, userId);

    return { total, messages };
  },

  // --------------------
  // GỬI TIN NHẮN (qua REST API - fallback khi socket không dùng được)
  // --------------------
  async sendMessage({ roomId, senderId, content, type, mediaUrl, replyToId }) {
    const isMember = await chatRepository.isMember(roomId, senderId);
    if (!isMember) throw new AppError('Bạn không có quyền gửi tin nhắn vào phòng này', 403);

    if (!content?.trim() && !mediaUrl) {
      throw new AppError('Nội dung tin nhắn không được để trống', 400);
    }

    const message = await chatRepository.createMessage({
      roomId,
      senderId,
      content,
      type,
      mediaUrl,
      replyToId,
    });

    // Emit qua socket nếu có
    const io = global.io;
    if (io) {
      io.to(`room:${roomId}`).emit('chat:new_message', message);
    }

    return message;
  },

  // --------------------
  // THU HỒI TIN NHẮN
  // --------------------
  async deleteMessage(messageId, userId) {
    const { ChatMessage } = require('./chat.model');
    const message = await ChatMessage.findByPk(messageId);
    if (!message) throw new AppError('Không tìm thấy tin nhắn', 404);
    if (message.sender_id !== userId) throw new AppError('Bạn không có quyền thu hồi tin nhắn này', 403);

    await chatRepository.softDeleteMessage(messageId, userId);

    // Emit event thu hồi
    const io = global.io;
    if (io) {
      io.to(`room:${message.room_id}`).emit('chat:message_deleted', {
        messageId,
        roomId: message.room_id,
      });
    }

    return true;
  },

  // --------------------
  // ĐÁNH DẤU ĐÃ ĐỌC
  // --------------------
  async markRoomAsRead(roomId, userId) {
    return chatRepository.markRoomAsRead(roomId, userId);
  },

  // --------------------
  // TỔNG SỐ CHƯA ĐỌC
  // --------------------
  async getTotalUnread(userId) {
    return chatRepository.getTotalUnread(userId);
  },
};

module.exports = chatService;
