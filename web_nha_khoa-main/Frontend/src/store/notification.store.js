import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import notificationApi from '../api/notification.api';

const INITIAL_STATE = {
  notifications: [],
  unreadCount: 0,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  loading: false,
  loadingMore: false,
  error: null,
  markingId: null, // ID being marked as read
  markingAll: false,
};

const useNotificationStore = create(
  devtools(
    (set, get) => ({
      ...INITIAL_STATE,

      // ─── Fetch notifications (initial load) ───────────────────────
      fetchNotifications: async (params = {}) => {
        set({ loading: true, error: null });
        try {
          const res = await notificationApi.getNotifications({
            page: 1,
            limit: get().pagination.limit,
            ...params,
          });
          const { data, pagination } = res.data;
          set({
            notifications: data,
            pagination: {
              ...get().pagination,
              ...pagination,
              page: 1,
            },
            loading: false,
          });
        } catch (err) {
          set({
            error: err.response?.data?.message || 'Không thể tải thông báo',
            loading: false,
          });
        }
      },

      // ─── Load more (pagination) ────────────────────────────────────
      loadMoreNotifications: async () => {
        const { pagination, loadingMore } = get();
        if (loadingMore || pagination.page >= pagination.totalPages) return;

        const nextPage = pagination.page + 1;
        set({ loadingMore: true });
        try {
          const res = await notificationApi.getNotifications({
            page: nextPage,
            limit: pagination.limit,
          });
          const { data, pagination: newPagination } = res.data;
          set((state) => ({
            notifications: [...state.notifications, ...data],
            pagination: { ...state.pagination, ...newPagination, page: nextPage },
            loadingMore: false,
          }));
        } catch (err) {
          set({
            error: err.response?.data?.message || 'Không thể tải thêm thông báo',
            loadingMore: false,
          });
        }
      },

      // ─── Fetch unread count ────────────────────────────────────────
      fetchUnreadCount: async () => {
        try {
          const res = await notificationApi.getUnreadCount();
          set({ unreadCount: res.data.data.count });
        } catch {
          // silent fail — badge không critical
        }
      },

      // ─── Mark single as read ───────────────────────────────────────
      markAsRead: async (notificationId) => {
        const notification = get().notifications.find((n) => n._id === notificationId);
        if (!notification || notification.isRead) return;

        set({ markingId: notificationId });
        try {
          await notificationApi.markAsRead(notificationId);
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n._id === notificationId ? { ...n, isRead: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
            markingId: null,
          }));
        } catch (err) {
          set({
            error: err.response?.data?.message || 'Không thể đánh dấu đã đọc',
            markingId: null,
          });
        }
      },

      // ─── Mark all as read ─────────────────────────────────────────
      markAllAsRead: async () => {
        const hasUnread = get().notifications.some((n) => !n.isRead);
        if (!hasUnread) return;

        set({ markingAll: true });
        try {
          await notificationApi.markAllAsRead();
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
            unreadCount: 0,
            markingAll: false,
          }));
        } catch (err) {
          set({
            error: err.response?.data?.message || 'Không thể đánh dấu tất cả đã đọc',
            markingAll: false,
          });
        }
      },

      // ─── Receive realtime notification (from socket) ───────────────
      receiveNotification: (notification) => {
        set((state) => {
          // Prevent duplicates
          const exists = state.notifications.some((n) => n._id === notification._id);
          if (exists) return state;
          return {
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
            pagination: {
              ...state.pagination,
              total: state.pagination.total + 1,
            },
          };
        });
      },

      // ─── Delete notification ───────────────────────────────────────
      deleteNotification: async (notificationId) => {
        try {
          await notificationApi.deleteNotification(notificationId);
          set((state) => {
            const removed = state.notifications.find((n) => n._id === notificationId);
            return {
              notifications: state.notifications.filter((n) => n._id !== notificationId),
              unreadCount:
                removed && !removed.isRead
                  ? Math.max(0, state.unreadCount - 1)
                  : state.unreadCount,
              pagination: {
                ...state.pagination,
                total: Math.max(0, state.pagination.total - 1),
              },
            };
          });
        } catch (err) {
          set({ error: err.response?.data?.message || 'Không thể xóa thông báo' });
        }
      },

      // ─── Clear error ───────────────────────────────────────────────
      clearError: () => set({ error: null }),

      // ─── Reset store ───────────────────────────────────────────────
      reset: () => set(INITIAL_STATE),
    }),
    { name: 'NotificationStore' }
  )
);

export default useNotificationStore;
