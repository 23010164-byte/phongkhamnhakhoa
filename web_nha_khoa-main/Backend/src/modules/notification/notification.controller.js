const notificationService = require('./notification.service');
const { successResponse, paginatedResponse } = require('../../utils/response');

const notificationController = {
  async getMyNotifications(req, res, next) {
    try {
      const { notifications, total, unreadCount } = await notificationService.getMyNotifications(req.user.id, req.query);
      const { page = 1, limit = 20 } = req.query;
      return paginatedResponse(res, {
        data: notifications,
        total,
        page,
        limit,
        meta: { unreadCount },
      });
    } catch (error) { next(error); }
  },

  async markAsRead(req, res, next) {
    try {
      await notificationService.markAsRead(req.params.id, req.user.id);
      return successResponse(res, { message: 'Đã đánh dấu đã đọc' });
    } catch (error) { next(error); }
  },

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      return successResponse(res, { message: 'Đã đánh dấu tất cả là đã đọc' });
    } catch (error) { next(error); }
  },

  async delete(req, res, next) {
    try {
      await notificationService.delete(req.params.id, req.user.id);
      return successResponse(res, { message: 'Đã xóa thông báo' });
    } catch (error) { next(error); }
  },

  async deleteAll(req, res, next) {
    try {
      await notificationService.deleteAll(req.user.id);
      return successResponse(res, { message: 'Đã xóa tất cả thông báo' });
    } catch (error) { next(error); }
  },
};

module.exports = notificationController;
