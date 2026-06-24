import { useEffect, useRef } from 'react';
import useNotificationStore from '../store/notification.store';
import { initSocket } from '../socket/socketClient';
import { ACCESS_TOKEN } from '../utils/constants';

let socketInstance = null;

/**
 * Hook to manage Socket.io connection for notifications.
 * Connects once, listens for notification events, and cleans up on unmount.
 */
const useNotificationSocket = () => {
  const socketRef = useRef(null);
  const receiveNotification = useNotificationStore((s) => s.receiveNotification);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) return;

    // Reuse existing socket if connected
    if (socketInstance?.connected) {
      socketRef.current = socketInstance;
    } else {
      socketInstance = initSocket();
      socketRef.current = socketInstance;
    }

    const socket = socketRef.current;

    const handleNewNotification = (notification) => {
      receiveNotification(notification);
    };

    const handleNotificationRead = ({ notificationId }) => {
      // Optionally sync read state from server event
      useNotificationStore.getState().markAsRead(notificationId);
    };

    const handleUnreadCountUpdate = ({ count }) => {
      useNotificationStore.setState({ unreadCount: count });
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:read', handleNotificationRead);
    socket.on('notification:unread-count', handleUnreadCountUpdate);

    socket.on('connect', () => {
      fetchUnreadCount();
    });

    socket.on('connect_error', (err) => {});

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:read', handleNotificationRead);
      socket.off('notification:unread-count', handleUnreadCountUpdate);
    };
  }, [receiveNotification, fetchUnreadCount]);

  return socketRef.current;
};

export default useNotificationSocket;
