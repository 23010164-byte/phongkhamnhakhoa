const { Op } = require('sequelize');
const { ChatRoom, ChatMember, ChatMessage } = require('./chat.model');
const User = require('../user/user.model');
const { sequelize } = require('../../config/database');

const memberInclude = {
  model: ChatMember,
  as: 'members',
  include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'avatar', 'role'] }],
};

const chatRepository = {
  // ========================
  // ROOM
  // ========================
  async findOrCreatePrivateRoom(userId1, userId2) {
    // Tìm room private đã có giữa 2 user
    const existing = await ChatRoom.findOne({
      where: { type: 'private' },
      include: [
        { model: ChatMember, as: 'members', where: { user_id: userId1 }, attributes: [] },
      ],
      having: sequelize.literal(
        `(SELECT COUNT(*) FROM chat_members WHERE room_id = ChatRoom.id AND user_id = '${userId2}') > 0`
      ),
    });

    if (existing) return { room: existing, created: false };

    // Tạo mới
    const room = await ChatRoom.create({ type: 'private', created_by: userId1 });
    await ChatMember.bulkCreate([
      { room_id: room.id, user_id: userId1 },
      { room_id: room.id, user_id: userId2 },
    ]);

    return { room: await this.findRoomById(room.id, userId1), created: true };
  },

  async createGroupRoom({ name, memberIds, createdBy, appointmentId }) {
    const room = await ChatRoom.create({
      name,
      type: 'group',
      created_by: createdBy,
      appointment_id: appointmentId || null,
    });

    const allMemberIds = [...new Set([createdBy, ...memberIds])];
    await ChatMember.bulkCreate(
      allMemberIds.map((uid) => ({ room_id: room.id, user_id: uid }))
    );

    return this.findRoomById(room.id, createdBy);
  },

  async findRoomById(roomId, userId) {
    return ChatRoom.findByPk(roomId, {
      include: [
        {
          ...memberInclude,
          // Lấy unread_count của userId đang xem
          where: {},
          required: false,
        },
      ],
    });
  },

  async findRoomsByUser(userId, { offset, limit }) {
    const memberRooms = await ChatMember.findAll({
      where: { user_id: userId },
      attributes: ['room_id', 'unread_count', 'last_read_at'],
    });

    const roomIds = memberRooms.map((m) => m.room_id);
    if (!roomIds.length) return { total: 0, rooms: [] };

    const { count, rows } = await ChatRoom.findAndCountAll({
      where: { id: { [Op.in]: roomIds } },
      include: [memberInclude],
      order: [['last_message_at', 'DESC NULLS LAST']],
      limit,
      offset,
      distinct: true,
    });

    // Gắn unread_count cho từng room
    const unreadMap = Object.fromEntries(memberRooms.map((m) => [m.room_id, m.unread_count]));
    const rooms = rows.map((r) => {
      const plain = r.toJSON();
      plain.unread_count = unreadMap[r.id] || 0;
      return plain;
    });

    return { total: count, rooms };
  },

  async isMember(roomId, userId) {
    const member = await ChatMember.findOne({ where: { room_id: roomId, user_id: userId } });
    return !!member;
  },

  async updateRoomLastMessage(roomId, preview) {
    return ChatRoom.update(
      { last_message_at: new Date(), last_message_preview: preview?.slice(0, 200) },
      { where: { id: roomId } }
    );
  },

  // ========================
  // MESSAGES
  // ========================
  async createMessage({ roomId, senderId, content, type, mediaUrl, replyToId }) {
    const message = await ChatMessage.create({
      room_id: roomId,
      sender_id: senderId,
      content,
      type: type || 'text',
      media_url: mediaUrl || null,
      reply_to_id: replyToId || null,
    });

    // Cập nhật last message và tăng unread cho các member khác
    const preview = type === 'text' ? content : `[${type}]`;
    await this.updateRoomLastMessage(roomId, preview);

    await ChatMember.increment('unread_count', {
      where: { room_id: roomId, user_id: { [Op.ne]: senderId } },
    });

    return this.findMessageById(message.id);
  },

  async findMessageById(id) {
    return ChatMessage.findByPk(id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'full_name', 'avatar', 'role'] },
        {
          model: ChatMessage,
          as: 'replyTo',
          include: [{ model: User, as: 'sender', attributes: ['id', 'full_name'] }],
        },
      ],
    });
  },

  async findMessages(roomId, { offset, limit, before }) {
    const where = { room_id: roomId, is_deleted: false };
    if (before) where.created_at = { [Op.lt]: new Date(before) };

    const { count, rows } = await ChatMessage.findAndCountAll({
      where,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'full_name', 'avatar', 'role'] },
        {
          model: ChatMessage,
          as: 'replyTo',
          required: false,
          include: [{ model: User, as: 'sender', attributes: ['id', 'full_name'] }],
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return { total: count, messages: rows.reverse() };
  },

  async softDeleteMessage(messageId, userId) {
    return ChatMessage.update(
      { is_deleted: true, deleted_at: new Date(), content: 'Tin nhắn đã được thu hồi' },
      { where: { id: messageId, sender_id: userId } }
    );
  },

  // ========================
  // READ STATUS
  // ========================
  async markRoomAsRead(roomId, userId) {
    return ChatMember.update(
      { last_read_at: new Date(), unread_count: 0 },
      { where: { room_id: roomId, user_id: userId } }
    );
  },

  async getTotalUnread(userId) {
    const result = await ChatMember.sum('unread_count', { where: { user_id: userId } });
    return result || 0;
  },
};

module.exports = chatRepository;
