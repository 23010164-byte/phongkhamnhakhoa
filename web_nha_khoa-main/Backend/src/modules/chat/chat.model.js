const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

// ========================
// CHAT ROOM
// ========================
const ChatRoom = sequelize.define(
  'ChatRoom',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // null = private (1-1), có giá trị = group
    name: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('private', 'group'),
      defaultValue: 'private',
    },
    // Liên kết với appointment (phòng chat bác sĩ - bệnh nhân)
    appointment_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'appointments', key: 'id' },
    },
    last_message_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_message_preview: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    tableName: 'chat_rooms',
    indexes: [
      { fields: ['type'] },
      { fields: ['appointment_id'] },
      { fields: ['last_message_at'] },
    ],
  }
);

// ========================
// CHAT MEMBER (room members)
// ========================
const ChatMember = sequelize.define(
  'ChatMember',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'chat_rooms', key: 'id' },
      onDelete: 'CASCADE',
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    // Thời điểm đọc cuối cùng
    last_read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Số tin chưa đọc (cache)
    unread_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_muted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'chat_members',
    indexes: [
      { fields: ['room_id', 'user_id'], unique: true },
      { fields: ['user_id'] },
    ],
  }
);

// ========================
// CHAT MESSAGE
// ========================
const ChatMessage = sequelize.define(
  'ChatMessage',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    room_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'chat_rooms', key: 'id' },
      onDelete: 'CASCADE',
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('text', 'image', 'file', 'system'),
      defaultValue: 'text',
    },
    media_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Trả lời tin nhắn
    reply_to_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'chat_messages', key: 'id' },
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'chat_messages',
    indexes: [
      { fields: ['room_id'] },
      { fields: ['sender_id'] },
      { fields: ['room_id', 'created_at'] },
    ],
  }
);

module.exports = { ChatRoom, ChatMember, ChatMessage };
