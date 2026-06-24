const { Op } = require('sequelize');
const Notification = require('./notification.model');
const { sequelize } = require('../../config/database');

const notificationRepository = {
  async create(data) {
    return Notification.create(data);
  },

  async bulkCreate(items) {
    return Notification.bulkCreate(items);
  },

  async findAll({ userId, isRead, type, offset, limit }) {
    const where = { user_id: userId };
    if (typeof isRead !== 'undefined') where.is_read = isRead;
    if (type) where.type = type;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return { total: count, notifications: rows };
  },

  async countUnread(userId) {
    return Notification.count({ where: { user_id: userId, is_read: false } });
  },

  async markAsRead(id, userId) {
    return Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { id, user_id: userId } }
    );
  },

  async markAllAsRead(userId) {
    return Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { user_id: userId, is_read: false } }
    );
  },

  async delete(id, userId) {
    return Notification.destroy({ where: { id, user_id: userId } });
  },

  async deleteAll(userId) {
    return Notification.destroy({ where: { user_id: userId } });
  },
};

module.exports = notificationRepository;
