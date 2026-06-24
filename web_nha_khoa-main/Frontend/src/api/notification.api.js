import axiosClient from './axiosClient';

const NOTIFICATION_ENDPOINT = '/notifications';

const notificationApi = {
  /**
   * Get paginated notification list
   * @param {Object} params - { page, limit, unreadOnly }
   */
  getNotifications: (params = {}) => {
    const { page = 1, limit = 20, unreadOnly = false } = params;
    return axiosClient.get(NOTIFICATION_ENDPOINT, {
      params: { page, limit, unreadOnly },
    });
  },

  /**
   * Mark a single notification as read
   * @param {string} notificationId
   */
  markAsRead: (notificationId) => {
    return axiosClient.patch(`${NOTIFICATION_ENDPOINT}/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: () => {
    return axiosClient.patch(`${NOTIFICATION_ENDPOINT}/read-all`);
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: () => {
    return axiosClient.get(`${NOTIFICATION_ENDPOINT}/unread-count`);
  },

  /**
   * Delete a notification
   * @param {string} notificationId
   */
  deleteNotification: (notificationId) => {
    return axiosClient.delete(`${NOTIFICATION_ENDPOINT}/${notificationId}`);
  },
};

export default notificationApi;
