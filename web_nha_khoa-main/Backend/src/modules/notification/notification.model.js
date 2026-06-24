const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { NOTIFICATION_TYPE, NOTIFICATION_CHANNEL } = require('../../utils/constants');

const Notification = sequelize.define(
  'Notification',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM(...Object.values(NOTIFICATION_TYPE)),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // Data đính kèm (appointmentId, paymentId...)
    data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    channel: {
      type: DataTypes.ENUM(...Object.values(NOTIFICATION_CHANNEL)),
      defaultValue: NOTIFICATION_CHANNEL.IN_APP,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'notifications',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['is_read'] },
      { fields: ['type'] },
      { fields: ['user_id', 'is_read'] },
    ],
  }
);

module.exports = Notification;
